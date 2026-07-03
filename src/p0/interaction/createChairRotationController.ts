import { gsap } from "gsap";
import type { Group } from "three";
import { CHAIR_STATES, STATE_COUNT, STATE_STEP_RADIANS } from "./chairStates";
import { nearestStateIndex, nearestUnwrappedSnapAngle, normalizedDegrees } from "./angleMath";
import { applyColorForAngle } from "../materials/materialColorController";
import type { InteractiveMaterials } from "../materials/createInteractiveMaterials";
import type { P0Overlay } from "../ui/createP0Overlay";
import type { P0StateController } from "../createP0StateController";

interface ChairRotationControllerOptions {
  target: HTMLElement;
  chairGroup: Group;
  materials: InteractiveMaterials;
  overlay: P0Overlay;
  state: P0StateController;
  reducedMotion: boolean;
  onChange: () => void;
}

export interface ChairRotationController {
  snapToState: (index: number, animated?: boolean) => void;
  setAngle: (angle: number, animated?: boolean) => void;
  setMaterials: (materials: InteractiveMaterials) => void;
  resetToPink: () => void;
  killSnap: () => void;
  dispose: () => void;
}

const SENSITIVITY = 0.008;
const COPY_HYSTERESIS_DEGREES = 7;

function wrapStateIndex(index: number): number {
  return ((index % STATE_COUNT) + STATE_COUNT) % STATE_COUNT;
}

function shouldSwitchCopy(angle: number, activeCopyStateIndex: number): number {
  const nearest = nearestStateIndex(angle);
  if (nearest === activeCopyStateIndex) return activeCopyStateIndex;

  const normalized = normalizedDegrees(angle);
  const nearestDegrees = CHAIR_STATES[nearest].angle;
  const distance = Math.abs(((normalized - nearestDegrees + 540) % 360) - 180);
  return distance <= (36 - COPY_HYSTERESIS_DEGREES) ? nearest : activeCopyStateIndex;
}

export function createChairRotationController(options: ChairRotationControllerOptions): ChairRotationController {
  let materials = options.materials;
  let activePointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let startRotationY = 0;
  let snapTween: gsap.core.Tween | null = null;

  function syncAngle(angle: number, updateCopy = true): void {
    options.chairGroup.rotation.y = angle;
    const hex = applyColorForAngle(materials, angle);
    options.state.setAngle(angle);
    options.state.setCurrentColor(hex);

    if (updateCopy) {
      const snapshot = options.state.snapshot();
      const nextCopyIndex = shouldSwitchCopy(angle, snapshot.activeCopyStateIndex);
      if (nextCopyIndex !== snapshot.activeCopyStateIndex) {
        options.state.setCopyStateIndex(nextCopyIndex);
        options.overlay.setCopy(CHAIR_STATES[nextCopyIndex].copy);
      }
    }

    options.onChange();
  }

  function completeCopyForAngle(angle: number): void {
    const index = nearestStateIndex(angle);
    options.state.setCopyStateIndex(index);
    options.overlay.setCopy(CHAIR_STATES[index].copy);
  }

  function killSnap(): void {
    snapTween?.kill();
    snapTween = null;
  }

  function setAngle(angle: number, animated = false): void {
    killSnap();
    if (!animated || options.reducedMotion) {
      syncAngle(angle, false);
      completeCopyForAngle(angle);
      return;
    }

    snapTween = gsap.to(options.chairGroup.rotation, {
      y: angle,
      duration: 0.46,
      ease: "power3.out",
      onUpdate: () => syncAngle(options.chairGroup.rotation.y),
      onComplete: () => {
        syncAngle(angle, false);
        completeCopyForAngle(angle);
        snapTween = null;
      },
    });
  }

  function snapCurrent(): void {
    setAngle(nearestUnwrappedSnapAngle(options.chairGroup.rotation.y), true);
  }

  function snapToState(index: number, animated = true): void {
    const targetBase = wrapStateIndex(index) * STATE_STEP_RADIANS;
    const current = options.chairGroup.rotation.y;
    const turns = Math.round((current - targetBase) / (Math.PI * 2));
    const candidates = [
      targetBase + (turns - 1) * Math.PI * 2,
      targetBase + turns * Math.PI * 2,
      targetBase + (turns + 1) * Math.PI * 2,
    ];
    const target = candidates.reduce((best, value) => (
      Math.abs(value - current) < Math.abs(best - current) ? value : best
    ));
    setAngle(target, animated);
  }

  function pointerDown(event: PointerEvent): void {
    const snapshot = options.state.snapshot();
    if (!snapshot.assemblyComplete || !snapshot.interactionEnabled || activePointerId !== null) return;
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startRotationY = options.chairGroup.rotation.y;
    killSnap();
    options.state.setDragging(true);
    options.overlay.hint.hide();
    options.target.setPointerCapture(event.pointerId);
    options.target.focus({ preventScroll: true });
  }

  function pointerMove(event: PointerEvent): void {
    if (event.pointerId !== activePointerId) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dy) > Math.abs(dx) * 1.25) return;
    syncAngle(startRotationY + dx * SENSITIVITY);
  }

  function pointerEnd(event: PointerEvent): void {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    options.state.setDragging(false);
    if (options.target.hasPointerCapture(event.pointerId)) {
      options.target.releasePointerCapture(event.pointerId);
    }
    snapCurrent();
  }

  function keyDown(event: KeyboardEvent): void {
    const snapshot = options.state.snapshot();
    if (!snapshot.assemblyComplete || !snapshot.interactionEnabled) return;
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    options.overlay.hint.hide();
    const currentIndex = nearestStateIndex(options.chairGroup.rotation.y);
    snapToState(currentIndex + (event.key === "ArrowRight" ? 1 : -1), true);
  }

  options.target.tabIndex = 0;
  options.target.setAttribute("aria-label", "旋转椅子以切换颜色");
  options.target.addEventListener("pointerdown", pointerDown);
  options.target.addEventListener("pointermove", pointerMove);
  options.target.addEventListener("pointerup", pointerEnd);
  options.target.addEventListener("pointercancel", pointerEnd);
  options.target.addEventListener("keydown", keyDown);

  syncAngle(0, false);
  completeCopyForAngle(0);

  return {
    snapToState,
    setAngle,
    setMaterials(nextMaterials) {
      materials = nextMaterials;
      applyColorForAngle(materials, options.chairGroup.rotation.y);
    },
    resetToPink() {
      killSnap();
      syncAngle(0, false);
      completeCopyForAngle(0);
    },
    killSnap,
    dispose() {
      killSnap();
      options.target.removeEventListener("pointerdown", pointerDown);
      options.target.removeEventListener("pointermove", pointerMove);
      options.target.removeEventListener("pointerup", pointerEnd);
      options.target.removeEventListener("pointercancel", pointerEnd);
      options.target.removeEventListener("keydown", keyDown);
    },
  };
}
