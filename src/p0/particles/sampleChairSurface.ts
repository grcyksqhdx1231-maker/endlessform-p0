import {
  Box3,
  BufferAttribute,
  Group,
  Matrix3,
  Mesh,
  Object3D,
  Vector3,
} from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

export interface MeshParticleAllocation {
  meshName: string;
  area: number;
  count: number;
}

export interface SurfaceSampleResult {
  targetPositions: Float32Array;
  startPositions: Float32Array;
  delays: Float32Array;
  randoms: Float32Array;
  allocations: MeshParticleAllocation[];
  box: Box3;
}

interface CandidateMesh {
  mesh: Mesh;
  area: number;
}

type SeededMeshSurfaceSampler = MeshSurfaceSampler & {
  setRandomGenerator: (random: () => number) => MeshSurfaceSampler;
};

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function triangleArea(a: Vector3, b: Vector3, c: Vector3): number {
  return b.clone().sub(a).cross(c.clone().sub(a)).length() * 0.5;
}

function worldSurfaceArea(mesh: Mesh): number {
  const geometry = mesh.geometry;
  const position = geometry.getAttribute("position");
  if (!(position instanceof BufferAttribute)) return 0;

  const index = geometry.index;
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const normalMatrix = new Matrix3().getNormalMatrix(mesh.matrixWorld);
  let area = 0;

  const readVertex = (vertexIndex: number, target: Vector3): Vector3 => {
    target.fromBufferAttribute(position, vertexIndex);
    target.applyMatrix4(mesh.matrixWorld);
    return target;
  };

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      readVertex(index.getX(i), a);
      readVertex(index.getX(i + 1), b);
      readVertex(index.getX(i + 2), c);
      area += triangleArea(a, b, c);
    }
  } else {
    for (let i = 0; i < position.count; i += 3) {
      readVertex(i, a);
      readVertex(i + 1, b);
      readVertex(i + 2, c);
      area += triangleArea(a, b, c);
    }
  }

  normalMatrix.identity();
  return area;
}

function collectMeshes(root: Object3D): CandidateMesh[] {
  const meshes: CandidateMesh[] = [];

  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    if (!node.visible) return;
    if (!node.geometry.getAttribute("position")) return;

    const area = worldSurfaceArea(node);
    if (area <= 0) return;
    meshes.push({ mesh: node, area });
  });

  return meshes;
}

function allocateCounts(meshes: CandidateMesh[], totalCount: number): number[] {
  const minPerMesh = Math.min(128, Math.floor(totalCount / Math.max(meshes.length, 1)));
  const totalArea = meshes.reduce((sum, item) => sum + item.area, 0);
  const counts = meshes.map((item) => Math.max(minPerMesh, Math.floor((item.area / totalArea) * totalCount)));
  let delta = totalCount - counts.reduce((sum, count) => sum + count, 0);
  let index = 0;

  while (delta !== 0 && counts.length > 0) {
    const direction = delta > 0 ? 1 : -1;
    if (direction > 0 || counts[index] > minPerMesh) {
      counts[index] += direction;
      delta -= direction;
    }
    index = (index + 1) % counts.length;
  }

  return counts;
}

export function sampleChairSurface(chairGroup: Group, particleCount: number, seed = 20260701): SurfaceSampleResult {
  chairGroup.updateMatrixWorld(true);
  const meshes = collectMeshes(chairGroup);
  const counts = allocateCounts(meshes, particleCount);
  const random = seededRandom(seed);
  const box = new Box3().setFromObject(chairGroup);
  const size = box.getSize(new Vector3());
  const height = Math.max(size.y, 0.0001);
  const targetPositions = new Float32Array(particleCount * 3);
  const startPositions = new Float32Array(particleCount * 3);
  const delays = new Float32Array(particleCount);
  const randoms = new Float32Array(particleCount);
  const sampleLocal = new Vector3();
  const sampleWorld = new Vector3();
  const sampleTarget = new Vector3();
  let cursor = 0;

  meshes.forEach((item, meshIndex) => {
    const sampler = (new MeshSurfaceSampler(item.mesh) as SeededMeshSurfaceSampler).setRandomGenerator(random).build();
    const count = counts[meshIndex];

    for (let i = 0; i < count; i += 1) {
      sampler.sample(sampleLocal);
      sampleWorld.copy(sampleLocal).applyMatrix4(item.mesh.matrixWorld);
      sampleTarget.copy(sampleWorld);
      chairGroup.worldToLocal(sampleTarget);

      const offset = cursor * 3;
      const normalizedY = Math.min(1, Math.max(0, (sampleTarget.y - box.min.y) / height));
      const jitter = random();

      targetPositions[offset] = sampleTarget.x;
      targetPositions[offset + 1] = sampleTarget.y;
      targetPositions[offset + 2] = sampleTarget.z;

      startPositions[offset] = sampleTarget.x + (random() - 0.5) * size.x * 1.3;
      startPositions[offset + 1] = box.min.y - (0.05 + random() * 0.4) * height;
      startPositions[offset + 2] = sampleTarget.z + (random() - 0.5) * size.z * 0.8;

      delays[cursor] = normalizedY * 0.34 + jitter * 0.05;
      randoms[cursor] = random();
      cursor += 1;
    }
  });

  return {
    targetPositions,
    startPositions,
    delays,
    randoms,
    box,
    allocations: meshes.map((item, index) => ({
      meshName: item.mesh.name || `(mesh ${index + 1})`,
      area: item.area,
      count: counts[index],
    })),
  };
}
