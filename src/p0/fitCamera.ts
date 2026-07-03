import { Box3, Group, PerspectiveCamera, Vector3 } from "three";

export interface FitCameraOptions {
  fov: number;
  targetY: number;
  coverageHeight: number;
  visualYOffset: number;
}

const box = new Box3();
const size = new Vector3();
const center = new Vector3();

export function fitCamera(
  camera: PerspectiveCamera,
  chairGroup: Group,
  options: FitCameraOptions,
  viewportWidth: number,
  viewportHeight: number,
  sourceBox?: Box3,
): void {
  if (sourceBox) {
    box.copy(sourceBox);
  } else {
    box.setFromObject(chairGroup);
  }
  box.getSize(size);
  box.getCenter(center);

  const aspect = viewportWidth / Math.max(viewportHeight, 1);
  const targetHeight = size.y / Math.max(options.coverageHeight, 0.1);
  const targetWidth = size.x / Math.max(0.62, aspect * 1.68);
  const viewHeight = Math.max(targetHeight, targetWidth);
  const fovRadians = (options.fov * Math.PI) / 180;
  const distance = viewHeight / (2 * Math.tan(fovRadians / 2));

  camera.fov = options.fov;
  camera.aspect = aspect;
  camera.near = Math.max(0.01, distance - 20);
  camera.far = distance + 20;
  camera.position.set(0, options.targetY, distance);
  camera.lookAt(0, options.targetY + options.visualYOffset, 0);
  camera.updateProjectionMatrix();
}
