import {
  AxesHelper,
  Box3,
  Box3Helper,
  Group,
  PerspectiveCamera,
  Scene,
} from "three";

export interface SceneSetup {
  scene: Scene;
  camera: PerspectiveCamera;
  chairGroup: Group;
  helpers: {
    axes: AxesHelper;
    box: Box3Helper;
  };
}

export function createScene(): SceneSetup {
  const scene = new Scene();
  scene.background = null;
  scene.environmentIntensity = 0.95;

  const camera = new PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 1.35, 6);

  const chairGroup = new Group();
  chairGroup.name = "chairGroup";
  scene.add(chairGroup);

  const axes = new AxesHelper(1.2);
  axes.visible = false;
  scene.add(axes);

  const box = new Box3Helper(new Box3().setFromObject(chairGroup), 0x686868);
  box.visible = false;
  scene.add(box);

  return {
    scene,
    camera,
    chairGroup,
    helpers: { axes, box },
  };
}
