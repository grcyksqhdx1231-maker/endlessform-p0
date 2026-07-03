import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";

export interface RendererHandle {
  renderer: WebGLRenderer;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

export function createRenderer(canvas: HTMLCanvasElement): RendererHandle {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  function resize(width: number, height: number): void {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height, false);
  }

  return {
    renderer,
    resize,
    dispose: () => renderer.dispose(),
  };
}
