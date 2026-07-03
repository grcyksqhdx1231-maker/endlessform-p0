import { CHAIR_STATES } from "./interaction/chairStates";
import { nearestStateIndex, normalizedDegrees } from "./interaction/angleMath";

export interface P0StateSnapshot {
  assemblyComplete: boolean;
  interactionEnabled: boolean;
  isDragging: boolean;
  activeStateIndex: number;
  activeCopyStateIndex: number;
  currentUnwrappedAngle: number;
  normalizedAngleDegrees: number;
  reducedMotion: boolean;
  materialMode: "interactive" | "original";
  currentHexColor: string;
}

export interface P0StateController {
  snapshot: () => P0StateSnapshot;
  setAssemblyComplete: (complete: boolean) => void;
  setInteractionEnabled: (enabled: boolean) => void;
  setDragging: (dragging: boolean) => void;
  setAngle: (angle: number) => void;
  setCopyStateIndex: (index: number) => void;
  setCurrentColor: (hex: string) => void;
  resetToPink: () => void;
}

export function createP0StateController(reducedMotion: boolean): P0StateController {
  const state: P0StateSnapshot = {
    assemblyComplete: false,
    interactionEnabled: false,
    isDragging: false,
    activeStateIndex: 0,
    activeCopyStateIndex: 0,
    currentUnwrappedAngle: 0,
    normalizedAngleDegrees: 0,
    reducedMotion,
    materialMode: "interactive",
    currentHexColor: CHAIR_STATES[0].color,
  };

  return {
    snapshot: () => ({ ...state }),
    setAssemblyComplete(complete) {
      state.assemblyComplete = complete;
    },
    setInteractionEnabled(enabled) {
      state.interactionEnabled = enabled;
    },
    setDragging(dragging) {
      state.isDragging = dragging;
    },
    setAngle(angle) {
      state.currentUnwrappedAngle = angle;
      state.normalizedAngleDegrees = normalizedDegrees(angle);
      state.activeStateIndex = nearestStateIndex(angle);
    },
    setCopyStateIndex(index) {
      state.activeCopyStateIndex = index;
    },
    setCurrentColor(hex) {
      state.currentHexColor = hex;
    },
    resetToPink() {
      state.activeStateIndex = 0;
      state.activeCopyStateIndex = 0;
      state.currentUnwrappedAngle = 0;
      state.normalizedAngleDegrees = 0;
      state.currentHexColor = CHAIR_STATES[0].color;
    },
  };
}
