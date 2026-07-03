import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  NormalBlending,
  Points,
  ShaderMaterial,
} from "three";
import { particleFragmentShader, particleVertexShader } from "./particleShaders";
import { sampleChairSurface, type MeshParticleAllocation } from "./sampleChairSurface";
import type { ParticleQuality } from "./particleQuality";
import { particleCountForQuality } from "./particleQuality";

export interface ParticleAssembly {
  points: Points<BufferGeometry, ShaderMaterial>;
  material: ShaderMaterial;
  geometry: BufferGeometry;
  allocations: MeshParticleAllocation[];
  quality: ParticleQuality;
  count: number;
  memoryBytes: number;
  active: boolean;
  assemblyComplete: boolean;
  setActive: (active: boolean) => void;
  setComplete: (complete: boolean) => void;
  setPointSize: (size: number) => void;
  updateTime: (time: number) => void;
  snapshot: () => {
    active: boolean;
    assemblyComplete: boolean;
    visible: boolean;
    progress: number;
    opacity: number;
    pointSize: number;
    count: number;
    quality: ParticleQuality;
  };
  dispose: () => void;
}

export function createParticleAssembly(chairGroup: Group, quality: ParticleQuality): ParticleAssembly {
  const count = particleCountForQuality(quality);
  const samples = sampleChairSurface(chairGroup, count);
  const geometry = new BufferGeometry();

  geometry.setAttribute("position", new BufferAttribute(samples.startPositions, 3));
  geometry.setAttribute("aStartPosition", new BufferAttribute(samples.startPositions, 3));
  geometry.setAttribute("aTargetPosition", new BufferAttribute(samples.targetPositions, 3));
  geometry.setAttribute("aDelay", new BufferAttribute(samples.delays, 1));
  geometry.setAttribute("aRandom", new BufferAttribute(samples.randoms, 1));
  geometry.computeBoundingSphere();

  const material = new ShaderMaterial({
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uPointSize: { value: 2 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
      uColor: { value: new Color(0xd7d0c8) },
    },
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: NormalBlending,
  });

  const points = new Points(geometry, material);
  points.name = "particleAssembly";
  points.frustumCulled = false;
  chairGroup.add(points);

  const memoryBytes = (
    samples.startPositions.byteLength +
    samples.targetPositions.byteLength +
    samples.delays.byteLength +
    samples.randoms.byteLength
  );

  const assembly: ParticleAssembly = {
    points,
    material,
    geometry,
    quality,
    count,
    allocations: samples.allocations,
    memoryBytes,
    active: false,
    assemblyComplete: false,
    setActive(active) {
      assembly.active = active;
    },
    setComplete(complete) {
      assembly.assemblyComplete = complete;
    },
    setPointSize(size) {
      material.uniforms.uPointSize.value = size;
    },
    updateTime(time) {
      if (assembly.active) {
        material.uniforms.uTime.value = time;
      }
    },
    snapshot() {
      return {
        active: assembly.active,
        assemblyComplete: assembly.assemblyComplete,
        visible: points.visible,
        progress: material.uniforms.uProgress.value as number,
        opacity: material.uniforms.uOpacity.value as number,
        pointSize: material.uniforms.uPointSize.value as number,
        count,
        quality,
      };
    },
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };

  return assembly;
}
