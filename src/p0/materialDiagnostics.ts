import {
  Color,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from "three";

interface MeshMaterialEntry {
  mesh: Mesh;
  original: Material | Material[];
  diagnostic: Material | Material[];
}

function cloneDiagnosticMaterial(material: Material): Material {
  if (!(material instanceof MeshStandardMaterial)) {
    return material.clone();
  }

  const clone = material.clone();
  clone.name = `${material.name || "material"} / neutral diagnostic`;
  clone.map = null;
  clone.color = new Color(0xb8babd);
  clone.needsUpdate = true;
  return clone;
}

function disposeMaterial(material: Material): void {
  material.dispose();
}

export interface MaterialDiagnosticHandle {
  mode: "original" | "neutral";
  setMode: (mode: "original" | "neutral") => void;
  dispose: () => void;
}

export function createMaterialDiagnostics(root: Object3D): MaterialDiagnosticHandle {
  const entries: MeshMaterialEntry[] = [];

  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    const original = node.material;
    const originals = Array.isArray(original) ? original : [original];
    const diagnostics = originals.map(cloneDiagnosticMaterial);

    entries.push({
      mesh: node,
      original,
      diagnostic: Array.isArray(original) ? diagnostics : diagnostics[0],
    });
  });

  const handle: MaterialDiagnosticHandle = {
    mode: "original",
    setMode(mode) {
      handle.mode = mode;
      entries.forEach((entry) => {
        entry.mesh.material = mode === "neutral" ? entry.diagnostic : entry.original;
      });
    },
    dispose() {
      handle.setMode("original");
      entries.forEach((entry) => {
        const materials = Array.isArray(entry.diagnostic) ? entry.diagnostic : [entry.diagnostic];
        materials.forEach(disposeMaterial);
      });
    },
  };

  return handle;
}
