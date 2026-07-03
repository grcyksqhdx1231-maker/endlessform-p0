import { PMREMGenerator, Scene, Texture, WebGLRenderer } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export interface EnvironmentHandle {
  texture: Texture;
  dispose: () => void;
}

export function createEnvironment(scene: Scene, renderer: WebGLRenderer): EnvironmentHandle {
  const roomEnvironment = new RoomEnvironment();
  const pmremGenerator = new PMREMGenerator(renderer);
  const renderTarget = pmremGenerator.fromScene(roomEnvironment);

  scene.environment = renderTarget.texture;

  roomEnvironment.dispose();
  pmremGenerator.dispose();

  return {
    texture: renderTarget.texture,
    dispose: () => {
      scene.environment = null;
      renderTarget.dispose();
    },
  };
}
