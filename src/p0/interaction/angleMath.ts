import { STATE_COUNT, STATE_STEP_RADIANS } from "./chairStates";

const TAU = Math.PI * 2;

export function normalizeAngle(angle: number): number {
  return ((angle % TAU) + TAU) % TAU;
}

export function nearestStateIndex(angle: number): number {
  return Math.round(normalizeAngle(angle) / STATE_STEP_RADIANS) % STATE_COUNT;
}

export function stateBlend(angle: number): { fromIndex: number; toIndex: number; localT: number } {
  const normalized = normalizeAngle(angle);
  const position = normalized / STATE_STEP_RADIANS;
  const fromIndex = Math.floor(position) % STATE_COUNT;
  const toIndex = (fromIndex + 1) % STATE_COUNT;
  const localT = position - Math.floor(position);
  return { fromIndex, toIndex, localT };
}

export function nearestUnwrappedSnapAngle(angle: number): number {
  return Math.round(angle / STATE_STEP_RADIANS) * STATE_STEP_RADIANS;
}

export function normalizedDegrees(angle: number): number {
  return (normalizeAngle(angle) * 180) / Math.PI;
}
