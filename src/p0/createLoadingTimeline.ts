import { gsap } from "gsap";
import { Material, Mesh, Object3D } from "three";
import type { ParticleAssembly } from "./particles/createParticleAssembly";

interface MaterialState {
  material: Material;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}

export interface LoadingTimelineHandle {
  timeline: gsap.core.Timeline;
  replay: () => void;
  seek: (time: number) => void;
  completeImmediately: () => void;
  dispose: () => void;
}

function uniqueMaterials(root: Object3D): Material[] {
  const materials = new Set<Material>();
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const meshMaterials = Array.isArray(node.material) ? node.material : [node.material];
    meshMaterials.forEach((material) => materials.add(material));
  });
  return [...materials];
}

function captureMaterialStates(root: Object3D): MaterialState[] {
  return uniqueMaterials(root).map((material) => ({
    material,
    opacity: material.opacity,
    transparent: material.transparent,
    depthWrite: material.depthWrite,
  }));
}

function setSolidOpacity(states: MaterialState[], opacity: number): void {
  states.forEach(({ material }) => {
    material.transparent = true;
    material.opacity = opacity;
    material.depthWrite = opacity >= 0.98;
    material.needsUpdate = true;
  });
}

function restoreMaterials(states: MaterialState[]): void {
  states.forEach((state) => {
    state.material.opacity = state.opacity;
    state.material.transparent = state.transparent;
    state.material.depthWrite = state.depthWrite;
    state.material.needsUpdate = true;
  });
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeInOutPower2(value: number): number {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function easeOutPower2(value: number): number {
  return 1 - Math.pow(1 - value, 2);
}

export function createLoadingTimeline(
  modelRoot: Object3D,
  particleAssembly: ParticleAssembly,
  onUpdate: () => void,
  onAssemblyComplete: () => void,
): LoadingTimelineHandle {
  const materialStates = captureMaterialStates(modelRoot);
  const solid = { opacity: 0 };
  const uniforms = particleAssembly.material.uniforms;
  const timeline = gsap.timeline({
    paused: true,
    onUpdate,
  });

  function resetState(): void {
    timeline.pause(0);
    solid.opacity = 0;
    uniforms.uProgress.value = 0;
    uniforms.uOpacity.value = 1;
    particleAssembly.points.visible = true;
    particleAssembly.setActive(true);
    particleAssembly.setComplete(false);
    setSolidOpacity(materialStates, 0);
    onUpdate();
  }

  function seekTime(time: number): void {
    const particleProgress = easeInOutPower2(clamp01((time - 0.15) / 1.55));
    const solidOpacity = easeOutPower2(clamp01((time - 1.15) / 0.75));
    const particleOpacity = 1 - easeOutPower2(clamp01((time - 1.65) / 0.45));

    timeline.pause(time);
    uniforms.uProgress.value = particleProgress;
    uniforms.uOpacity.value = time >= 2.1 ? 0 : particleOpacity;
    setSolidOpacity(materialStates, solidOpacity);

    if (time >= 2.1) {
      particleAssembly.points.visible = false;
      particleAssembly.setActive(false);
      restoreMaterials(materialStates);
    } else {
      particleAssembly.points.visible = true;
      particleAssembly.setActive(true);
      particleAssembly.setComplete(false);
    }

    if (time >= 2.15) {
      particleAssembly.setComplete(true);
      onAssemblyComplete();
    }

    onUpdate();
  }

  timeline
    .call(() => {
      solid.opacity = 0;
      setSolidOpacity(materialStates, 0);
      particleAssembly.points.visible = true;
      particleAssembly.setActive(true);
      particleAssembly.setComplete(false);
    }, [], 0)
    .to(uniforms.uProgress, {
      value: 1,
      duration: 1.55,
      ease: "power2.inOut",
    }, 0.15)
    .to(solid, {
      opacity: 1,
      duration: 0.75,
      ease: "power2.out",
      onUpdate: () => setSolidOpacity(materialStates, solid.opacity),
    }, 1.15)
    .to(uniforms.uOpacity, {
      value: 0,
      duration: 0.45,
      ease: "power2.out",
    }, 1.65)
    .call(() => {
      particleAssembly.points.visible = false;
      particleAssembly.setActive(false);
      uniforms.uOpacity.value = 0;
      restoreMaterials(materialStates);
    }, [], 2.1)
    .call(() => {
      particleAssembly.setComplete(true);
      onAssemblyComplete();
      onUpdate();
    }, [], 2.15);

  resetState();

  return {
    timeline,
    replay() {
      resetState();
      timeline.play(0);
    },
    seek(time) {
      seekTime(time);
    },
    completeImmediately() {
      timeline.pause(2.2);
      uniforms.uProgress.value = 1;
      uniforms.uOpacity.value = 0;
      particleAssembly.points.visible = false;
      particleAssembly.setActive(false);
      particleAssembly.setComplete(true);
      restoreMaterials(materialStates);
      onAssemblyComplete();
      onUpdate();
    },
    dispose() {
      timeline.kill();
      restoreMaterials(materialStates);
    },
  };
}
