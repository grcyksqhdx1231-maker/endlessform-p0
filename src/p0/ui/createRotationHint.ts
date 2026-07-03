import { gsap } from "gsap";

const STORAGE_KEY = "endlessform-p0-rotation-hint-seen";

export interface RotationHint {
  element: HTMLElement;
  show: () => void;
  hide: () => void;
  clearSeen: () => void;
}

export function createRotationHint(reducedMotion: boolean): RotationHint {
  const element = document.createElement("div");
  element.className = "rotation-hint";
  element.innerHTML = `
    <svg viewBox="0 0 64 24" aria-hidden="true">
      <path d="M18 8 C11 8 8 12 8 16" />
      <path d="M8 16 l-3 -3 M8 16 l3 -3" />
      <path d="M46 8 C53 8 56 12 56 16" />
      <path d="M56 16 l-3 -3 M56 16 l3 -3" />
      <path d="M31 6 v9 c0 2 1.4 3.6 3.4 3.6 h3.6" />
      <path d="M27 10 h8" />
    </svg>
    <span>左右滑动旋转</span>
  `;

  return {
    element,
    show() {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
      element.style.display = "flex";
      gsap.to(element, { opacity: 1, duration: reducedMotion ? 0.12 : 0.45, ease: "power2.out" });
    },
    hide() {
      sessionStorage.setItem(STORAGE_KEY, "1");
      gsap.to(element, {
        opacity: 0,
        duration: reducedMotion ? 0.08 : 0.25,
        ease: "power2.out",
        onComplete: () => {
          element.style.display = "none";
        },
      });
    },
    clearSeen() {
      sessionStorage.removeItem(STORAGE_KEY);
    },
  };
}
