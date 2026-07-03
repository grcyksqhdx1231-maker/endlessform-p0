import { Color, Material, Mesh, MeshStandardMaterial, Object3D } from "three";

interface MeshMaterialRecord {
  mesh: Mesh;
  original: Material | Material[];
  interactive: Material | Material[];
}

function cloneInteractiveMaterial(material: Material, color: Color): Material {
  if (!(material instanceof MeshStandardMaterial)) {
    const clone = material.clone();
    return clone;
  }

  const clone = material.clone();
  clone.name = `${material.name || "material"} / interactive pastel`;
  clone.map = null;
  clone.color.copy(color);
  clone.needsUpdate = true;
  return clone;
}

export interface InteractiveMaterials {
  mode: "interactive" | "original";
  materials: MeshStandardMaterial[];
  setMode: (mode: "interactive" | "original") => void;
  setColor: (color: Color | string) => void;
  dispose: () => void;
}

export function createInteractiveMaterials(root: Object3D, initialColor: string): InteractiveMaterials {
  const color = new Color(initialColor);
  const records: MeshMaterialRecord[] = [];
  const interactiveSet = new Set<MeshStandardMaterial>();

  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    const original = node.material;
    const originals = Array.isArray(original) ? original : [original];
    const interactive = originals.map((material) => {
      const clone = cloneInteractiveMaterial(material, color);
      if (clone instanceof MeshStandardMaterial) interactiveSet.add(clone);
      return clone;
    });

    records.push({
      mesh: node,
      original,
      interactive: Array.isArray(original) ? interactive : interactive[0],
    });
  });

  const handle: InteractiveMaterials = {
    mode: "interactive",
    materials: [...interactiveSet],
    setMode(mode) {
      handle.mode = mode;
      records.forEach((record) => {
        record.mesh.material = mode === "interactive" ? record.interactive : record.original;
      });
    },
    setColor(nextColor) {
      const next = nextColor instanceof Color ? nextColor : new Color(nextColor);
      handle.materials.forEach((material) => {
        material.color.copy(next);
        material.needsUpdate = true;
      });
    },
    dispose() {
      handle.setMode("original");
      handle.materials.forEach((material) => material.dispose());
    },
  };

  handle.setMode("interactive");
  return handle;
}
