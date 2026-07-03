import {
  BufferGeometry,
  Material,
  Mesh,
  Object3D,
  Scene,
  Texture,
} from "three";

function isTexture(value: unknown): value is Texture {
  return value instanceof Texture;
}

function disposeMaterial(material: Material): void {
  const record = material as unknown as Record<string, unknown>;
  for (const value of Object.values(record)) {
    if (isTexture(value)) {
      value.dispose();
    }
  }
  material.dispose();
}

export function disposeScene(scene: Scene): void {
  scene.traverse((node: Object3D) => {
    if (node instanceof Mesh) {
      if (node.geometry instanceof BufferGeometry) {
        node.geometry.dispose();
      }
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(disposeMaterial);
    }
  });
}

export function disposeObject3D(root: Object3D): void {
  root.traverse((node: Object3D) => {
    if (node instanceof Mesh) {
      if (node.geometry instanceof BufferGeometry) {
        node.geometry.dispose();
      }
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach(disposeMaterial);
    }
  });
}
