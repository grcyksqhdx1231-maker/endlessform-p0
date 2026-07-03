import { Box3Helper, CameraHelper, Group, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import type { FitCameraOptions } from "./fitCamera";
import type { ContactShadow } from "./createContactShadow";
import type { LightRig } from "./createLights";
import type { MaterialDiagnosticHandle } from "./materialDiagnostics";

export interface DebugState {
  fov: number;
  targetY: number;
}

interface DebugPanelOptions {
  chairGroup: Group;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  scene: Scene;
  lightRig: LightRig;
  helpers: {
    axes: { visible: boolean };
    box: Box3Helper;
  };
  contactShadow: ContactShadow;
  materialDiagnostics: MaterialDiagnosticHandle;
  fitOptions: FitCameraOptions;
  runtime: {
    box: { min: Vector3; max: Vector3 };
    center: Vector3;
    size: Vector3;
    materials: Array<{ name: string; type: string; mapNames: string[] }>;
  };
  onChange: () => void;
}

function degrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function createDebugPanel(options: DebugPanelOptions): DebugState {
  const state: DebugState = {
    fov: options.fitOptions.fov,
    targetY: options.fitOptions.targetY,
  };

  const panel = document.createElement("aside");
  panel.className = "debug-panel";
  panel.innerHTML = `
    <h2>Phase 1 Debug</h2>
    <label>rotation Y <output data-value="rotation"></output><input data-control="rotation" type="range" min="-180" max="360" step="1"></label>
    <label>uniform scale <output data-value="scale"></output><input data-control="scale" type="range" min="0.55" max="1.45" step="0.01"></label>
    <label>Y offset <output data-value="offsetY"></output><input data-control="offsetY" type="range" min="-1" max="1" step="0.01"></label>
    <label>camera FOV <output data-value="fov"></output><input data-control="fov" type="range" min="22" max="36" step="0.1"></label>
    <label>camera target Y <output data-value="targetY"></output><input data-control="targetY" type="range" min="-1" max="1.6" step="0.01"></label>
    <label>tone exposure <output data-value="exposure"></output><input data-control="exposure" type="range" min="0.85" max="1.35" step="0.01"></label>
    <label>environment intensity <output data-value="environmentIntensity"></output><input data-control="environmentIntensity" type="range" min="0.40" max="1.40" step="0.01"></label>
    <label>environment rotation Y <output data-value="environmentRotation"></output><input data-control="environmentRotation" type="range" min="-180" max="180" step="1"></label>
    <label>key intensity <output data-value="key"></output><input data-control="key" type="range" min="0" max="1.6" step="0.01"></label>
    <label>fill intensity <output data-value="fill"></output><input data-control="fill" type="range" min="0" max="0.9" step="0.01"></label>
    <label>rim intensity <output data-value="rim"></output><input data-control="rim" type="range" min="0" max="0.9" step="0.01"></label>
    <label>shadow opacity <output data-value="shadowOpacity"></output><input data-control="shadowOpacity" type="range" min="0.025" max="0.065" step="0.001"></label>
    <label>Material preview <select data-control="materialPreview"><option value="original">Original textured PBR</option><option value="neutral">Neutral diagnostic PBR</option></select></label>
    <label>BoundingBox <input data-control="box" type="checkbox"></label>
    <label>Axes <input data-control="axes" type="checkbox"></label>
    <label>Contact shadow <input data-control="shadow" type="checkbox" checked></label>
    <button type="button" data-control="copy">复制当前参数</button>
    <pre data-value="snapshot"></pre>
  `;
  document.body.appendChild(panel);

  const cameraHelper = new CameraHelper(options.camera);
  cameraHelper.visible = false;
  options.chairGroup.parent?.add(cameraHelper);

  const rotation = panel.querySelector<HTMLInputElement>('[data-control="rotation"]')!;
  const scale = panel.querySelector<HTMLInputElement>('[data-control="scale"]')!;
  const offsetY = panel.querySelector<HTMLInputElement>('[data-control="offsetY"]')!;
  const fov = panel.querySelector<HTMLInputElement>('[data-control="fov"]')!;
  const targetY = panel.querySelector<HTMLInputElement>('[data-control="targetY"]')!;
  const exposure = panel.querySelector<HTMLInputElement>('[data-control="exposure"]')!;
  const environmentIntensity = panel.querySelector<HTMLInputElement>('[data-control="environmentIntensity"]')!;
  const environmentRotation = panel.querySelector<HTMLInputElement>('[data-control="environmentRotation"]')!;
  const key = panel.querySelector<HTMLInputElement>('[data-control="key"]')!;
  const fill = panel.querySelector<HTMLInputElement>('[data-control="fill"]')!;
  const rim = panel.querySelector<HTMLInputElement>('[data-control="rim"]')!;
  const shadowOpacity = panel.querySelector<HTMLInputElement>('[data-control="shadowOpacity"]')!;
  const materialPreview = panel.querySelector<HTMLSelectElement>('[data-control="materialPreview"]')!;
  const box = panel.querySelector<HTMLInputElement>('[data-control="box"]')!;
  const axes = panel.querySelector<HTMLInputElement>('[data-control="axes"]')!;
  const shadow = panel.querySelector<HTMLInputElement>('[data-control="shadow"]')!;
  const copy = panel.querySelector<HTMLButtonElement>('[data-control="copy"]')!;
  const snapshot = panel.querySelector<HTMLElement>('[data-value="snapshot"]')!;

  rotation.value = String(Math.round(degrees(options.chairGroup.rotation.y)));
  scale.value = String(options.chairGroup.scale.x);
  offsetY.value = String(options.chairGroup.position.y);
  fov.value = String(state.fov);
  targetY.value = String(state.targetY);
  exposure.value = String(options.renderer.toneMappingExposure);
  environmentIntensity.value = String(options.scene.environmentIntensity);
  environmentRotation.value = String(Math.round(degrees(options.scene.environmentRotation.y)));
  key.value = String(options.lightRig.key.intensity);
  fill.value = String(options.lightRig.fill.intensity);
  rim.value = String(options.lightRig.rim.intensity);
  shadowOpacity.value = String(options.lightRig.preset.shadowOpacity);

  function update(): void {
    const rotationDegrees = Number(rotation.value);
    options.chairGroup.rotation.y = (rotationDegrees * Math.PI) / 180;
    options.chairGroup.scale.setScalar(Number(scale.value));
    options.chairGroup.position.y = Number(offsetY.value);
    state.fov = Number(fov.value);
    state.targetY = Number(targetY.value);
    options.renderer.toneMappingExposure = Number(exposure.value);
    options.scene.environmentIntensity = Number(environmentIntensity.value);
    options.scene.environmentRotation.y = (Number(environmentRotation.value) * Math.PI) / 180;
    options.lightRig.key.intensity = Number(key.value);
    options.lightRig.fill.intensity = Number(fill.value);
    options.lightRig.rim.intensity = Number(rim.value);
    options.lightRig.preset = {
      ...options.lightRig.preset,
      exposure: Number(exposure.value),
      environmentIntensity: Number(environmentIntensity.value),
      environmentRotationYDegrees: Number(environmentRotation.value),
      key: Number(key.value),
      fill: Number(fill.value),
      rim: Number(rim.value),
      shadowOpacity: Number(shadowOpacity.value),
    };
    options.helpers.box.visible = box.checked;
    options.helpers.box.box.setFromObject(options.chairGroup);
    options.helpers.axes.visible = axes.checked;
    options.contactShadow.mesh.visible = shadow.checked;
    options.contactShadow.setOpacity(Number(shadowOpacity.value));
    options.materialDiagnostics.setMode(materialPreview.value === "neutral" ? "neutral" : "original");
    cameraHelper.update();

    panel.querySelector<HTMLElement>('[data-value="rotation"]')!.textContent = `${rotationDegrees}°`;
    panel.querySelector<HTMLElement>('[data-value="scale"]')!.textContent = Number(scale.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="offsetY"]')!.textContent = Number(offsetY.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="fov"]')!.textContent = Number(fov.value).toFixed(1);
    panel.querySelector<HTMLElement>('[data-value="targetY"]')!.textContent = Number(targetY.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="exposure"]')!.textContent = Number(exposure.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="environmentIntensity"]')!.textContent = Number(environmentIntensity.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="environmentRotation"]')!.textContent = `${Number(environmentRotation.value).toFixed(0)}°`;
    panel.querySelector<HTMLElement>('[data-value="key"]')!.textContent = Number(key.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="fill"]')!.textContent = Number(fill.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="rim"]')!.textContent = Number(rim.value).toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="shadowOpacity"]')!.textContent = Number(shadowOpacity.value).toFixed(3);

    snapshot.textContent = JSON.stringify(
      {
        rotationYDegrees: rotationDegrees,
        scale: Number(scale.value),
        yOffset: Number(offsetY.value),
        fov: state.fov,
        targetY: state.targetY,
        lighting: options.lightRig.summary(),
        materialPreview: options.materialDiagnostics.mode,
        bbox: {
          min: options.runtime.box.min.toArray(),
          max: options.runtime.box.max.toArray(),
          center: options.runtime.center.toArray(),
          size: options.runtime.size.toArray(),
        },
        materials: options.runtime.materials,
      },
      null,
      2,
    );
    options.onChange();
  }

  panel.addEventListener("input", update);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(snapshot.textContent || "");
  });
  update();
  return state;
}
