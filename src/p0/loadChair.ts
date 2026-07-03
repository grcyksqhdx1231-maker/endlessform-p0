import {
  Box3,
  Group,
  Material,
  Mesh,
  Object3D,
  Texture,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface LoadedChair {
  root: Object3D;
  worldBox: Box3;
  worldCenter: Vector3;
  worldSize: Vector3;
  materials: Array<{
    name: string;
    type: string;
    mapNames: string[];
  }>;
}

function uniqueMaterials(root: Object3D): Material[] {
  const set = new Set<Material>();
  root.traverse((node: Object3D) => {
    if (node instanceof Mesh) {
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material: Material) => set.add(material));
    }
  });
  return [...set];
}

function isTexture(value: unknown): value is Texture {
  return value instanceof Texture;
}

function textureNames(material: Material): string[] {
  const record = material as unknown as Record<string, unknown>;
  const names: string[] = [];
  for (const key of ["map", "metalnessMap", "roughnessMap", "normalMap", "aoMap", "emissiveMap"]) {
    const value = record[key];
    if (isTexture(value)) {
      names.push(`${key}:${value.name || "embedded texture"}`);
    }
  }
  return names;
}

export async function loadChair(url: string, chairGroup: Group): Promise<LoadedChair> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  const root = gltf.scene;

  root.updateMatrixWorld(true);
  const sourceBox = new Box3().setFromObject(root);
  const center = sourceBox.getCenter(new Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);

  chairGroup.add(root);
  chairGroup.updateMatrixWorld(true);

  const worldBox = new Box3().setFromObject(chairGroup);
  const worldCenter = worldBox.getCenter(new Vector3());
  const worldSize = worldBox.getSize(new Vector3());

  chairGroup.traverse((node: Object3D) => {
    if (node instanceof Mesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const materials = uniqueMaterials(root).map((material) => ({
    name: material.name || "(unnamed material)",
    type: material.type,
    mapNames: textureNames(material),
  }));

  return {
    root,
    worldBox,
    worldCenter,
    worldSize,
    materials,
  };
}
