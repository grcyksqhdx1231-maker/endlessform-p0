import {
  DirectionalLight,
  HemisphereLight,
  Scene,
} from "three";

export interface LightingPreset {
  exposure: number;
  environmentIntensity: number;
  environmentRotationYDegrees: number;
  hemisphere: number;
  key: number;
  fill: number;
  rim: number;
  shadowOpacity: number;
}

export interface LightSummary {
  exposure: number;
  environmentIntensity: number;
  environmentRotationYDegrees: number;
  hemisphere: {
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  key: {
    position: number[];
    intensity: number;
    castShadow: boolean;
  };
  fill: {
    position: number[];
    intensity: number;
    castShadow: boolean;
  };
  rim: {
    position: number[];
    intensity: number;
    castShadow: boolean;
  };
  shadowOpacity: number;
}

export interface LightRig {
  hemi: HemisphereLight;
  key: DirectionalLight;
  fill: DirectionalLight;
  rim: DirectionalLight;
  preset: LightingPreset;
  applyPreset: (preset: LightingPreset) => void;
  summary: () => LightSummary;
}

export const LIGHTING_PRESETS = {
  base: {
    exposure: 1.16,
    environmentIntensity: 1.08,
    environmentRotationYDegrees: 0,
    hemisphere: 0.35,
    key: 1.05,
    fill: 0.46,
    rim: 0.44,
    shadowOpacity: 0.035,
  },
  balanced: {
    exposure: 1.08,
    environmentIntensity: 0.85,
    environmentRotationYDegrees: 0,
    hemisphere: 0.35,
    key: 1.15,
    fill: 0.34,
    rim: 0.42,
    shadowOpacity: 0.04,
  },
  brighter: {
    exposure: 1.16,
    environmentIntensity: 1.08,
    environmentRotationYDegrees: 0,
    hemisphere: 0.35,
    key: 1.05,
    fill: 0.46,
    rim: 0.44,
    shadowOpacity: 0.035,
  },
  gallery: {
    exposure: 1.1,
    environmentIntensity: 0.98,
    environmentRotationYDegrees: 0,
    hemisphere: 0.35,
    key: 0.88,
    fill: 0.42,
    rim: 0.3,
    shadowOpacity: 0.03,
  },
} satisfies Record<string, LightingPreset>;

export type LightingPresetName = keyof typeof LIGHTING_PRESETS;

export function createLights(scene: Scene): LightRig {
  const hemi = new HemisphereLight(0xffffff, 0xf2f2f2, LIGHTING_PRESETS.base.hemisphere);
  hemi.name = "hemiLight";
  hemi.castShadow = false;
  scene.add(hemi);

  const key = new DirectionalLight(0xffffff, LIGHTING_PRESETS.base.key);
  key.name = "keyLight";
  key.position.set(-3.5, 6.8, 4.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -2.8;
  key.shadow.camera.right = 2.8;
  key.shadow.camera.top = 2.8;
  key.shadow.camera.bottom = -2.8;
  key.shadow.bias = -0.00008;
  scene.add(key);

  const fill = new DirectionalLight(0xffffff, LIGHTING_PRESETS.base.fill);
  fill.name = "fillLight";
  fill.position.set(4.2, 3.2, 4.6);
  fill.castShadow = false;
  scene.add(fill);

  const rim = new DirectionalLight(0xffffff, LIGHTING_PRESETS.base.rim);
  rim.name = "rimLight";
  rim.position.set(-2.5, 4.8, -4);
  rim.castShadow = false;
  scene.add(rim);

  const rig: LightRig = {
    hemi,
    key,
    fill,
    rim,
    preset: { ...LIGHTING_PRESETS.base },
    applyPreset(preset: LightingPreset) {
      rig.preset = { ...preset };
      scene.environmentIntensity = preset.environmentIntensity;
      scene.environmentRotation.y = (preset.environmentRotationYDegrees * Math.PI) / 180;
      hemi.intensity = preset.hemisphere;
      key.intensity = preset.key;
      fill.intensity = preset.fill;
      rim.intensity = preset.rim;
    },
    summary() {
      return {
        exposure: rig.preset.exposure,
        environmentIntensity: scene.environmentIntensity,
        environmentRotationYDegrees: (scene.environmentRotation.y * 180) / Math.PI,
        hemisphere: {
          skyColor: "#ffffff",
          groundColor: "#f2f2f2",
          intensity: hemi.intensity,
        },
        key: {
          position: key.position.toArray(),
          intensity: key.intensity,
          castShadow: key.castShadow,
        },
        fill: {
          position: fill.position.toArray(),
          intensity: fill.intensity,
          castShadow: fill.castShadow,
        },
        rim: {
          position: rim.position.toArray(),
          intensity: rim.intensity,
          castShadow: rim.castShadow,
        },
        shadowOpacity: rig.preset.shadowOpacity,
      };
    },
  };

  rig.applyPreset(LIGHTING_PRESETS.base);
  return rig;
}
