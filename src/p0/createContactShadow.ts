import {
  Box3,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
  Vector3,
} from "three";

export interface ContactShadow {
  mesh: Mesh<PlaneGeometry, ShadowMaterial>;
  setOpacity: (opacity: number) => void;
}

export function createContactShadow(box: Box3): ContactShadow {
  const size = box.getSize(new Vector3());
  const width = Math.max(size.x, size.z) * 1.75;
  const geometry = new PlaneGeometry(width, width);
  const material = new ShadowMaterial({
    color: 0x000000,
    opacity: 0.045,
    transparent: true,
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = "contactShadow";
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = box.min.y - 0.012;
  mesh.receiveShadow = true;
  return {
    mesh,
    setOpacity: (opacity: number) => {
      material.opacity = opacity;
    },
  };
}
