import "./styles.css";
import { Box3, Group, Object3D, Vector3 } from "three";
import { gsap } from "gsap";
import { createRenderer } from "./p0/createRenderer";
import { createScene } from "./p0/createScene";
import { loadChair } from "./p0/loadChair";
import { fitCamera, type FitCameraOptions } from "./p0/fitCamera";
import { createLights, LIGHTING_PRESETS, type LightingPresetName } from "./p0/createLights";
import { createContactShadow } from "./p0/createContactShadow";
import { createDebugPanel, type DebugState } from "./p0/createDebugPanel";
import { disposeObject3D, disposeScene } from "./p0/dispose";
import { createEnvironment } from "./p0/createEnvironment";
import { createMaterialDiagnostics, type MaterialDiagnosticHandle } from "./p0/materialDiagnostics";
import { createParticleAssembly, type ParticleAssembly } from "./p0/particles/createParticleAssembly";
import { selectParticleQuality } from "./p0/particles/particleQuality";
import { createLoadingTimeline, type LoadingTimelineHandle } from "./p0/createLoadingTimeline";
import { prefersReducedMotion } from "./p0/reducedMotion";
import { createParticleDebugPanel } from "./p0/createParticleDebugPanel";
import { CHAIR_STATES, STATE_STEP_RADIANS } from "./p0/interaction/chairStates";
import { createInteractiveMaterials, type InteractiveMaterials } from "./p0/materials/createInteractiveMaterials";
import { createP0Overlay, type P0Overlay } from "./p0/ui/createP0Overlay";
import { createPrototypeShell, type PrototypeShell } from "./p0/ui/createPrototypeShell";
import { createP0StateController, type P0StateController } from "./p0/createP0StateController";
import { createChairRotationController, type ChairRotationController } from "./p0/interaction/createChairRotationController";
import { createPhase3DebugPanel } from "./p0/createPhase3DebugPanel";

const canvas = document.querySelector<HTMLCanvasElement>("#p0-canvas");
const errorNode = document.querySelector<HTMLElement>("#webgl-error");
const appRoot = document.querySelector<HTMLElement>("#app");

if (!canvas) {
  throw new Error("Missing #p0-canvas element.");
}
if (!appRoot) {
  throw new Error("Missing #app root.");
}
const canvasElement = canvas;
const appElement = appRoot;

function installDevicePreview(root: HTMLElement): void {
  if (root.parentElement?.classList.contains("device-shell")) return;
  const stage = document.createElement("div");
  stage.className = "device-stage";
  const shell = document.createElement("div");
  shell.className = "device-shell";
  root.before(stage);
  stage.append(shell);
  shell.append(root);
}

function updateDeviceScale(): void {
  const shell = document.querySelector<HTMLElement>(".device-shell");
  if (!shell) return;
  const scale = Math.min((window.innerWidth - 40) / 417, (window.innerHeight - 40) / 876, 1);
  shell.style.setProperty("--device-scale", String(Math.max(0.1, scale)));
}

installDevicePreview(appElement);
updateDeviceScale();

const urlParams = new URLSearchParams(window.location.search);
const debugEnabled = urlParams.get("debug") === "1";
const captureMode = urlParams.get("capture");
const captureEnabled = captureMode !== null;
const reducedMotion = prefersReducedMotion();
const rendererHandle = createRenderer(canvas);
const { scene, camera, chairGroup, helpers } = createScene();
const environmentHandle = createEnvironment(scene, rendererHandle.renderer);
const lightRig = createLights(scene);
const runtimeStateNode = document.createElement("script");

runtimeStateNode.id = "p0-runtime-state";
runtimeStateNode.type = "application/json";
document.head.append(runtimeStateNode);

let animationFrame = 0;
let isRunning = true;
let isDisposed = false;
let debugState: DebugState | null = null;
let materialDiagnostics: MaterialDiagnosticHandle | null = null;
let interactiveMaterials: InteractiveMaterials | null = null;
let overlay: P0Overlay | null = null;
let p0State: P0StateController | null = null;
let rotationController: ChairRotationController | null = null;
let particleAssembly: ParticleAssembly | null = null;
let loadingTimeline: LoadingTimelineHandle | null = null;
let prototypeShell: PrototypeShell | null = null;
let disposeParticleDebug: (() => void) | null = null;
let disposePhase3Debug: (() => void) | null = null;
let resumeTimelineAfterVisibility = false;
let wasGsapPausedByVisibility = false;
let lastFrameTime = performance.now();
const fpsSamples: number[] = [];
let staticChairBox: Box3 | null = null;
let staticChairCenter: Vector3 | null = null;
let staticChairSize: Vector3 | null = null;
let chairMaterialsSnapshot: Awaited<ReturnType<typeof loadChair>>["materials"] = [];
let currentChairRoot: Object3D | null = null;
let currentModelUrl = "/models/p0-chair.glb";
let modelSwitchRequest = 0;

const fitOptions: FitCameraOptions = {
  fov: 28,
  targetY: 0.16,
  coverageHeight: 0.46,
  visualYOffset: 0.0,
};

function requestedRotationDegrees(): number | null {
  const value = urlParams.get("rotation");
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requestedLightingPresetName(): LightingPresetName {
  const value = urlParams.get("lighting");
  if (value === "balanced" || value === "brighter" || value === "gallery" || value === "base") return value;
  return "brighter";
}

function requestedMaterialMode(): "original" | "neutral" {
  return urlParams.get("material") === "neutral" ? "neutral" : "original";
}

function resize(): void {
  updateDeviceScale();
  const width = appElement.clientWidth || window.innerWidth;
  const height = appElement.clientHeight || window.innerHeight;
  rendererHandle.resize(width, height);
  if (debugState) {
    fitOptions.fov = debugState.fov;
    fitOptions.targetY = debugState.targetY;
  }
  fitCamera(camera, chairGroup, fitOptions, width, height, staticChairBox || undefined);
}

function render(): void {
  rendererHandle.renderer.render(scene, camera);
}

function captureTime(): number | null {
  if (captureMode === "assembly" || captureMode === "phase2-keyframe" || captureMode === "k1") return 1.15;
  if (captureMode === "complete" || captureMode === "phase2-complete") return 2.2;
  if (captureMode === "phase2-early") return 0.7;
  if (captureMode === "phase2-late") return 1.78;
  return null;
}

function captureStateIndex(): number | null {
  if (!captureMode?.startsWith("k")) return null;
  const parsed = Number(captureMode.slice(1));
  if (!Number.isInteger(parsed) || parsed < 2 || parsed > 6) return null;
  return parsed - 2;
}

function updateFpsSample(now: number): void {
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  if (delta <= 0) return;
  fpsSamples.push(1000 / delta);
  if (fpsSamples.length > 180) fpsSamples.shift();
}

function averageFps(): number {
  if (fpsSamples.length === 0) return 0;
  return fpsSamples.reduce((sum, value) => sum + value, 0) / fpsSamples.length;
}

function getRuntimeSnapshot() {
  const currentBox = staticChairBox || new Box3().setFromObject(chairGroup);
  const currentCenter = staticChairCenter || currentBox.getCenter(new Vector3());
  const currentSize = staticChairSize || currentBox.getSize(new Vector3());

  return {
    rotationYDegrees: (chairGroup.rotation.y * 180) / Math.PI,
    chairGroup: {
      position: chairGroup.position.toArray(),
      scale: chairGroup.scale.toArray(),
      rotation: [chairGroup.rotation.x, chairGroup.rotation.y, chairGroup.rotation.z],
    },
    camera: {
      fov: camera.fov,
      position: camera.position.toArray(),
      near: camera.near,
      far: camera.far,
    },
    box: {
      min: currentBox.min.toArray(),
      max: currentBox.max.toArray(),
      center: currentCenter.toArray(),
      size: currentSize.toArray(),
    },
    renderer: {
      outputColorSpace: rendererHandle.renderer.outputColorSpace,
      toneMapping: rendererHandle.renderer.toneMapping,
      toneMappingExposure: rendererHandle.renderer.toneMappingExposure,
    },
    lighting: lightRig.summary(),
    materials: chairMaterialsSnapshot,
    modelUrl: currentModelUrl,
    materialPreview: materialDiagnostics?.mode || "original",
    interactiveMaterialMode: interactiveMaterials?.mode || "interactive",
    p0: p0State?.snapshot() || null,
    reducedMotion,
    particles: particleAssembly
      ? {
          ...particleAssembly.snapshot(),
          allocations: particleAssembly.allocations,
          memoryBytes: particleAssembly.memoryBytes,
        }
      : null,
    performance: {
      averageFps: averageFps(),
      fpsSampleCount: fpsSamples.length,
    },
  };
}

function writeRuntimeSnapshot(): void {
  runtimeStateNode.textContent = JSON.stringify(getRuntimeSnapshot());
}

function tick(): void {
  if (!isRunning || isDisposed) return;
  const now = performance.now();
  updateFpsSample(now);
  particleAssembly?.updateTime(now * 0.001);
  render();
  animationFrame = window.requestAnimationFrame(tick);
}

function startLoop(): void {
  if (isRunning) return;
  isRunning = true;
  tick();
}

function stopLoop(): void {
  isRunning = false;
  window.cancelAnimationFrame(animationFrame);
}

function handleVisibility(): void {
  if (document.hidden) {
    resumeTimelineAfterVisibility = !!loadingTimeline && !loadingTimeline.timeline.paused();
    loadingTimeline?.timeline.pause();
    wasGsapPausedByVisibility = !gsap.globalTimeline.paused();
    gsap.globalTimeline.pause();
    stopLoop();
  } else {
    startLoop();
    if (wasGsapPausedByVisibility) gsap.globalTimeline.resume();
    if (resumeTimelineAfterVisibility && !particleAssembly?.assemblyComplete) {
      loadingTimeline?.timeline.play();
    }
    resumeTimelineAfterVisibility = false;
    wasGsapPausedByVisibility = false;
  }
}

function showError(error: unknown): void {
  console.error("Failed to load P0 chair model:", error);
  if (errorNode) errorNode.hidden = false;
}

function enableInteraction(): void {
  p0State?.setAssemblyComplete(true);
  p0State?.setInteractionEnabled(true);
  if (!captureEnabled) overlay?.hint.show();
  writeRuntimeSnapshot();
}

async function switchChairModel(modelUrl: string): Promise<void> {
  if (modelUrl === currentModelUrl || !rotationController || !p0State) return;
  const requestId = ++modelSwitchRequest;

  try {
    const tempGroup = new Group();
    const nextChair = await loadChair(modelUrl, tempGroup);
    if (requestId !== modelSwitchRequest) {
      disposeObject3D(nextChair.root);
      return;
    }

    const previousRoot = currentChairRoot;
    materialDiagnostics?.dispose();
    interactiveMaterials?.dispose();

    if (previousRoot) {
      chairGroup.remove(previousRoot);
      disposeObject3D(previousRoot);
    }

    chairGroup.add(nextChair.root);
    currentChairRoot = nextChair.root;
    currentModelUrl = modelUrl;
    chairMaterialsSnapshot = nextChair.materials;

    materialDiagnostics = createMaterialDiagnostics(nextChair.root);
    materialDiagnostics.setMode(debugEnabled && requestedMaterialMode() === "neutral" ? "neutral" : "original");
    interactiveMaterials = createInteractiveMaterials(nextChair.root, CHAIR_STATES[0].color);
    interactiveMaterials.setMode("original");
    rotationController.setMaterials(interactiveMaterials);

    const modelBox = new Box3().setFromObject(nextChair.root);
    staticChairBox = modelBox.clone();
    staticChairCenter = modelBox.getCenter(new Vector3());
    staticChairSize = modelBox.getSize(new Vector3());
    resize();
    writeRuntimeSnapshot();
    render();
  } catch (error) {
    console.warn("Failed to switch chair model:", modelUrl, error);
  }
}

function prepareReplay(): void {
  rotationController?.killSnap();
  p0State?.setAssemblyComplete(false);
  p0State?.setInteractionEnabled(false);
  p0State?.setDragging(false);
  p0State?.resetToPink();
  interactiveMaterials?.setMode("original");
  rotationController?.resetToPink();
  overlay?.setCopy(CHAIR_STATES[0].copy);
}

async function boot(): Promise<void> {
  const chair = await loadChair("/models/p0-chair.glb", chairGroup);
  currentChairRoot = chair.root;
  currentModelUrl = "/models/p0-chair.glb";
  chairMaterialsSnapshot = chair.materials;
  materialDiagnostics = createMaterialDiagnostics(chair.root);
  interactiveMaterials = createInteractiveMaterials(chair.root, CHAIR_STATES[0].color);
  p0State = createP0StateController(reducedMotion);
  overlay = createP0Overlay(CHAIR_STATES[0].copy, reducedMotion);

  chairGroup.position.y = 0;
  chairGroup.scale.setScalar(1);
  chairGroup.rotation.y = 0;
  const initialRotation = requestedRotationDegrees();
  if (initialRotation !== null) {
    chairGroup.rotation.y = (initialRotation * Math.PI) / 180;
  }

  const contactShadow = createContactShadow(chair.worldBox);
  scene.add(contactShadow.mesh);

  const preset = LIGHTING_PRESETS[requestedLightingPresetName()];
  lightRig.applyPreset(preset);
  rendererHandle.renderer.toneMappingExposure = preset.exposure;
  contactShadow.setOpacity(preset.shadowOpacity);
  materialDiagnostics.setMode(debugEnabled && requestedMaterialMode() === "neutral" ? "neutral" : "original");
  interactiveMaterials.setMode("original");

  const runtimeBox = new Box3().setFromObject(chairGroup);
  const runtimeCenter = runtimeBox.getCenter(new Vector3());
  const runtimeSize = runtimeBox.getSize(new Vector3());
  staticChairBox = runtimeBox.clone();
  staticChairCenter = runtimeCenter.clone();
  staticChairSize = runtimeSize.clone();

  rotationController = createChairRotationController({
    target: canvasElement,
    chairGroup,
    materials: interactiveMaterials,
    overlay,
    state: p0State,
    reducedMotion,
    onChange: writeRuntimeSnapshot,
  });

  const particleQuality = selectParticleQuality(reducedMotion);
  particleAssembly = createParticleAssembly(chairGroup, particleQuality);
  loadingTimeline = createLoadingTimeline(chair.root, particleAssembly, writeRuntimeSnapshot, enableInteraction);
  prototypeShell = createPrototypeShell({
    root: document.querySelector<HTMLElement>(".p0-page")!,
    overlay,
    rotation: rotationController,
    reducedMotion,
    onChairModelChange: (modelUrl) => {
      void switchChairModel(modelUrl);
    },
  });

  resize();
  overlay.showChrome();

  const captureAt = captureTime();
  const stateIndex = captureStateIndex();

  if (stateIndex !== null) {
    loadingTimeline.completeImmediately();
    rotationController.setAngle(stateIndex * STATE_STEP_RADIANS, false);
    p0State.setAssemblyComplete(true);
    p0State.setInteractionEnabled(false);
  } else if (reducedMotion) {
    loadingTimeline.completeImmediately();
  } else if (captureAt !== null) {
    if (captureAt >= 2.1) {
      loadingTimeline.completeImmediately();
    } else {
      p0State.setInteractionEnabled(false);
      loadingTimeline.seek(captureAt);
    }
  } else {
    prepareReplay();
    loadingTimeline.replay();
  }

  writeRuntimeSnapshot();

  Object.assign(window, {
    __P0_DEBUG__: {
      chairGroup,
      camera,
      scene,
      renderer: rendererHandle.renderer,
      runtimeBox,
      runtimeCenter,
      runtimeSize,
      fitOptions,
      lightRig,
      particleAssembly,
      loadingTimeline,
      p0State,
      rotationController,
      interactiveMaterials,
      replay() {
        if (!loadingTimeline) return;
        prepareReplay();
        loadingTimeline.replay();
      },
      setRotation(degrees: number) {
        rotationController?.setAngle((degrees * Math.PI) / 180, false);
        writeRuntimeSnapshot();
        render();
      },
      snapshot: getRuntimeSnapshot,
    },
  });

  if (debugEnabled) {
    debugState = createDebugPanel({
      chairGroup,
      camera,
      renderer: rendererHandle.renderer,
      scene,
      lightRig,
      helpers,
      contactShadow,
      materialDiagnostics,
      fitOptions,
      runtime: {
        box: runtimeBox,
        center: runtimeCenter,
        size: runtimeSize,
        materials: chair.materials,
      },
      onChange: () => {
        resize();
        render();
        writeRuntimeSnapshot();
      },
    });

    disposeParticleDebug = createParticleDebugPanel({
      particleAssembly,
      loadingTimeline,
      onChange: () => {
        render();
        writeRuntimeSnapshot();
      },
    });

    disposePhase3Debug = createPhase3DebugPanel({
      state: p0State,
      rotation: rotationController,
      materials: interactiveMaterials,
      overlay,
      onReplay: () => {
        prepareReplay();
        loadingTimeline?.replay();
      },
      onChange: () => {
        render();
        writeRuntimeSnapshot();
      },
    });
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", handleVisibility);
  tick();
}

boot().catch(showError);

window.addEventListener("beforeunload", () => {
  isDisposed = true;
  stopLoop();
  window.removeEventListener("resize", resize);
  document.removeEventListener("visibilitychange", handleVisibility);
  disposeParticleDebug?.();
  disposePhase3Debug?.();
  rotationController?.dispose();
  loadingTimeline?.dispose();
  prototypeShell?.dispose();
  materialDiagnostics?.dispose();
  interactiveMaterials?.dispose();
  overlay?.dispose();
  particleAssembly?.dispose();
  disposeScene(scene);
  environmentHandle.dispose();
  rendererHandle.dispose();
});
