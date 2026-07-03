import { Color } from "three";
import { CHAIR_STATES } from "../interaction/chairStates";
import { stateBlend } from "../interaction/angleMath";
import type { InteractiveMaterials } from "./createInteractiveMaterials";

const fromColor = new Color();
const toColor = new Color();
const mixedColor = new Color();

export function colorForAngle(angle: number): Color {
  const blend = stateBlend(angle);
  fromColor.set(CHAIR_STATES[blend.fromIndex].color);
  toColor.set(CHAIR_STATES[blend.toIndex].color);
  mixedColor.lerpColors(fromColor, toColor, blend.localT);
  return mixedColor;
}

export function applyColorForAngle(materials: InteractiveMaterials, angle: number): string {
  const color = colorForAngle(angle);
  materials.setColor(color);
  return `#${color.getHexString()}`;
}
