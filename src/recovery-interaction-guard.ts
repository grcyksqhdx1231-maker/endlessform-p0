type GestureMode = "IDLE" | "PENDING" | "ROTATE" | "SCROLL_OR_SWITCH";
type GestureZone = "CHAIR" | "SCROLL" | "NAV";

interface RuntimeSnapshot {
  rotationYDegrees?: number;
  p0?: { activeStateIndex?: number };
}

interface RuntimeDebug {
  rotationController?: {
    setAngle: (angle: number, animated?: boolean) => void;
    snapToState: (index: number, animated?: boolean) => void;
  };
  snapshot?: () => RuntimeSnapshot;
}

declare global {
  interface Window {
    __P0_DEBUG__?: RuntimeDebug;
  }
}

const GESTURE_START_THRESHOLD = 8;
const DIRECTION_LOCK_RATIO = 1.25;
const CHAIR_SWITCH_THRESHOLD = 56;
const SWITCH_LOCK_MS = 820;
const HINT_STORAGE_KEY = "endlessform-mobile-gesture-hint-seen";

const controlSelector = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "[role='button']",
  ".bottom-nav",
  ".page-bottom-nav",
  ".action-rail",
  ".top-custom-button",
  ".ai-chat-panel",
  ".chair-tree-topbar",
  ".chair-tree-toolbar",
  ".chair-tree-detail",
].join(",");

const style = document.createElement("style");
style.textContent = `
  html,
  body,
  #app {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  .prototype-ui {
    overscroll-behavior-x: none !important;
  }

  .prototype-ui .bottom-nav {
    z-index: 42 !important;
    pointer-events: auto !important;
    touch-action: manipulation !important;
  }

  .prototype-ui .bottom-nav button,
  .prototype-ui .top-custom-button,
  .prototype-ui .action-rail button {
    min-width: 44px !important;
    min-height: 44px !important;
    pointer-events: auto !important;
    touch-action: manipulation !important;
  }

  .prototype-ui[data-view]:not([data-view="home"]) .page-bottom-nav,
  .prototype-ui .purchase-bottom-tools {
    display: none !important;
    pointer-events: none !important;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .action-rail {
    top: auto !important;
    right: 18px !important;
    bottom: calc(env(safe-area-inset-bottom) + 148px) !important;
    left: 18px !important;
    width: auto !important;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;
    align-items: center !important;
    pointer-events: none !important;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .action-rail .round-action:first-child {
    order: 2;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .action-rail .round-action:last-child {
    order: 1;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .action-rail button {
    pointer-events: auto !important;
  }

  .mobile-gesture-zones {
    position: absolute;
    z-index: 10;
    inset: 0;
    display: none;
    pointer-events: none;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"]:not([data-view]) .mobile-gesture-zones,
  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"][data-view="home"] .mobile-gesture-zones {
    display: block;
  }

  .chair-interaction-zone,
  .page-scroll-zone {
    position: absolute;
    right: 0;
    left: 0;
    pointer-events: auto;
  }

  .chair-interaction-zone {
    top: 13%;
    height: 49%;
    touch-action: pan-y;
  }

  .page-scroll-zone {
    top: 62%;
    bottom: calc(env(safe-area-inset-bottom) + 76px);
    touch-action: none;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .p0-canvas {
    touch-action: pan-y !important;
  }

  .prototype-ui .mobile-swipe-cue {
    position: absolute;
    z-index: 18;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom) + 144px);
    display: none;
    grid-template-columns: auto auto;
    align-items: center;
    gap: 6px;
    color: #686864;
    white-space: nowrap;
    font-size: 10px;
    line-height: 14px;
    pointer-events: none;
    transform: translateX(-50%);
  }

  .prototype-ui .mobile-swipe-cue svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .prototype-ui[data-gesture-hint="visible"][data-app-stage="main"][data-cover-stage="feed"]:not([data-view]) .mobile-swipe-cue,
  .prototype-ui[data-gesture-hint="visible"][data-app-stage="main"][data-cover-stage="feed"][data-view="home"] .mobile-swipe-cue {
    display: grid;
    animation: mobile-gesture-hint-in 2.8s ease both;
  }

  @keyframes mobile-gesture-hint-in {
    0% { opacity: 0; transform: translate(-50%, 6px); }
    14%, 72% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -3px); }
  }

  .intro-primary-entry {
    appearance: none;
    color: #544e4e;
    min-width: 174px;
    min-height: 44px;
    font: inherit;
    letter-spacing: 0;
    background: transparent;
    border: 1px solid #544e4e66;
    border-radius: 999px;
    padding: 0 18px;
    transition: opacity 0.16s ease, transform 0.16s ease;
    touch-action: manipulation;
  }

  .intro-primary-entry:active {
    opacity: 0.62;
    transform: scale(0.97);
  }

  .intro-primary-entry[disabled] {
    opacity: 0.45;
  }

  .prototype-ui[data-mobile-scene-step="0"] .showcase-enter {
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .prototype-ui[data-mobile-scene-step="1"] .showcase-enter {
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .prototype-ui .mobile-swipe-cue {
      animation: none !important;
    }
  }
`;
document.head.append(style);

let gestureMode: GestureMode = "IDLE";
let gestureZone: GestureZone = "NAV";
let activePointerId: number | null = null;
let startX = 0;
let startY = 0;
let startRotation = 0;
let activeGestureTarget: Element | null = null;
let switchLockedUntil = 0;
let previousStage = "";
let hintTimer = 0;
let stagePointer:
  | { id: number; stage: "intro" | "scene-showcase"; x: number; y: number }
  | null = null;

function prototypeApp(): HTMLElement | null {
  const app = document.getElementById("app");
  return app?.classList.contains("prototype-ui") ? app : null;
}

function isControlTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(controlSelector));
}

function isHomeFeed(app: HTMLElement): boolean {
  const view = app.dataset.view;
  return (
    app.dataset.appStage === "main" &&
    app.dataset.coverStage === "feed" &&
    (!view || view === "home")
  );
}

function currentRotationRadians(): number {
  const degrees = window.__P0_DEBUG__?.snapshot?.().rotationYDegrees ?? 0;
  return (degrees * Math.PI) / 180;
}

function zoneFromTarget(target: EventTarget | null): GestureZone {
  if (!(target instanceof Element)) return "NAV";
  if (target.closest("[data-gesture-zone='chair']")) return "CHAIR";
  if (target.closest("[data-gesture-zone='scroll']")) return "SCROLL";
  return "NAV";
}

function setGestureHintSeen(): void {
  const app = prototypeApp();
  if (app) app.dataset.gestureHint = "hidden";
  window.clearTimeout(hintTimer);
  try {
    sessionStorage.setItem(HINT_STORAGE_KEY, "1");
  } catch {
    // Storage can be unavailable in a restricted browser; the UI still works.
  }
}

function showGestureHintOnce(app: HTMLElement): void {
  let seen = false;
  try {
    seen = sessionStorage.getItem(HINT_STORAGE_KEY) === "1";
  } catch {
    seen = false;
  }
  if (seen) {
    app.dataset.gestureHint = "hidden";
    return;
  }
  app.dataset.gestureHint = "visible";
  window.clearTimeout(hintTimer);
  hintTimer = window.setTimeout(setGestureHintSeen, 3000);
}

function dispatchRuntimeWheel(app: HTMLElement, deltaY: number): void {
  app.dispatchEvent(
    new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY,
    }),
  );
}

function lockAndStepFeed(app: HTMLElement, direction: 1 | -1): void {
  const now = performance.now();
  if (now < switchLockedUntil) return;
  switchLockedUntil = now + SWITCH_LOCK_MS;
  setGestureHintSeen();
  dispatchRuntimeWheel(app, direction > 0 ? 120 : -120);
}

function resetGesture(): void {
  if (
    activePointerId !== null &&
    activeGestureTarget instanceof Element &&
    "hasPointerCapture" in activeGestureTarget &&
    activeGestureTarget.hasPointerCapture(activePointerId)
  ) {
    activeGestureTarget.releasePointerCapture(activePointerId);
  }
  gestureMode = "IDLE";
  gestureZone = "NAV";
  activePointerId = null;
  activeGestureTarget = null;
}

function updateSceneVisual(app: HTMLElement, index: 0 | 1): void {
  const backgrounds = [...app.querySelectorAll<HTMLElement>(".showcase-bg")];
  if (backgrounds.length === 0) return;
  const target = backgrounds.find((node) => Number(node.dataset.sceneIndex) === index) ?? backgrounds[index];
  backgrounds.forEach((node) => node.classList.toggle("is-visible", node === target));
  app.dataset.mobileSceneStep = String(index);
}

function handleStagePointerDown(event: PointerEvent, app: HTMLElement): boolean {
  const stage = app.dataset.appStage;
  if (stage !== "intro" && stage !== "scene-showcase") return false;
  if (isControlTarget(event.target)) return false;
  event.stopPropagation();
  stagePointer = {
    id: event.pointerId,
    stage,
    x: event.clientX,
    y: event.clientY,
  };
  return true;
}

function handleStagePointerMove(event: PointerEvent): boolean {
  if (!stagePointer || stagePointer.id !== event.pointerId) return false;
  event.stopPropagation();
  return true;
}

function handleStagePointerUp(event: PointerEvent, app: HTMLElement): boolean {
  if (!stagePointer || stagePointer.id !== event.pointerId) return false;
  const pointer = stagePointer;
  stagePointer = null;
  event.stopPropagation();

  if (pointer.stage !== "scene-showcase") return true;
  const dx = event.clientX - pointer.x;
  const dy = event.clientY - pointer.y;
  if (Math.abs(dy) < CHAIR_SWITCH_THRESHOLD || Math.abs(dy) < Math.abs(dx) * DIRECTION_LOCK_RATIO) {
    return true;
  }
  if (dy < 0 && app.dataset.mobileSceneStep !== "1") updateSceneVisual(app, 1);
  if (dy > 0 && app.dataset.mobileSceneStep === "1") updateSceneVisual(app, 0);
  return true;
}

function onPointerDown(event: PointerEvent): void {
  const app = prototypeApp();
  if (!app) return;
  if (handleStagePointerDown(event, app)) return;
  if (!isHomeFeed(app)) return;

  if (isControlTarget(event.target)) {
    event.stopPropagation();
    return;
  }

  const zone = zoneFromTarget(event.target);
  if (zone === "NAV") return;
  event.stopPropagation();

  gestureMode = "PENDING";
  gestureZone = zone;
  activePointerId = event.pointerId;
  startX = event.clientX;
  startY = event.clientY;
  startRotation = currentRotationRadians();
  activeGestureTarget = event.target instanceof Element ? event.target : null;
  if (activeGestureTarget instanceof Element && "setPointerCapture" in activeGestureTarget) {
    activeGestureTarget.setPointerCapture(event.pointerId);
  }
}

function onPointerMove(event: PointerEvent): void {
  if (handleStagePointerMove(event)) return;
  if (activePointerId !== event.pointerId || gestureMode === "IDLE") return;
  event.stopPropagation();

  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  if (gestureMode === "PENDING") {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < GESTURE_START_THRESHOLD) return;
    if (gestureZone === "CHAIR" && Math.abs(dx) >= Math.abs(dy) * DIRECTION_LOCK_RATIO) {
      gestureMode = "ROTATE";
      setGestureHintSeen();
    } else if (gestureZone === "SCROLL" && Math.abs(dy) >= Math.abs(dx) * DIRECTION_LOCK_RATIO) {
      gestureMode = "SCROLL_OR_SWITCH";
      setGestureHintSeen();
    } else {
      return;
    }
  }

  if (gestureMode === "ROTATE") {
    event.preventDefault();
    window.__P0_DEBUG__?.rotationController?.setAngle(startRotation + dx * 0.008, false);
  } else if (gestureMode === "SCROLL_OR_SWITCH") {
    event.preventDefault();
  }
}

function onPointerUp(event: PointerEvent): void {
  const app = prototypeApp();
  if (!app) return;
  if (handleStagePointerUp(event, app)) return;

  if (activePointerId !== event.pointerId || gestureMode === "IDLE") return;
  event.stopPropagation();
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  const completedMode = gestureMode;

  if (completedMode === "ROTATE") {
    const snapshot = window.__P0_DEBUG__?.snapshot?.();
    const stateIndex = snapshot?.p0?.activeStateIndex;
    if (typeof stateIndex === "number") {
      window.__P0_DEBUG__?.rotationController?.snapToState(stateIndex, true);
    }
  } else if (
    completedMode === "SCROLL_OR_SWITCH" &&
    Math.abs(dy) >= CHAIR_SWITCH_THRESHOLD &&
    Math.abs(dy) >= Math.abs(dx) * DIRECTION_LOCK_RATIO
  ) {
    lockAndStepFeed(app, dy < 0 ? 1 : -1);
  }

  resetGesture();
}

function onPointerCancel(event: PointerEvent): void {
  if (stagePointer?.id === event.pointerId) {
    stagePointer = null;
    event.stopPropagation();
  }
  if (activePointerId === event.pointerId) {
    event.stopPropagation();
    resetGesture();
  }
}

function onWheelCapture(event: WheelEvent): void {
  if (!event.isTrusted) return;
  const app = prototypeApp();
  if (!app) return;
  const stage = app.dataset.appStage;
  if (stage === "intro") {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (stage === "scene-showcase") {
    event.preventDefault();
    event.stopPropagation();
    if (event.deltaY > 18 && app.dataset.mobileSceneStep !== "1") updateSceneVisual(app, 1);
    if (event.deltaY < -18 && app.dataset.mobileSceneStep === "1") updateSceneVisual(app, 0);
  }
}

function ensureIntroEntry(app: HTMLElement): void {
  const introCopy = app.querySelector<HTMLElement>(".intro-copy");
  if (!introCopy || introCopy.querySelector(".intro-primary-entry")) return;
  const oldHint = introCopy.querySelector<HTMLElement>("span");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "intro-primary-entry";
  button.dataset.uiInteractive = "true";
  button.textContent = oldHint?.textContent?.trim() || "enter to explore";
  button.addEventListener("click", () => {
    if (button.disabled || app.dataset.appStage !== "intro") return;
    button.disabled = true;
    dispatchRuntimeWheel(app, 120);
    window.setTimeout(() => {
      button.disabled = false;
    }, 700);
  });
  if (oldHint) oldHint.replaceWith(button);
  else introCopy.append(button);
}

function ensureGestureZones(app: HTMLElement): void {
  if (app.querySelector(".mobile-gesture-zones")) return;
  const zones = document.createElement("div");
  zones.className = "mobile-gesture-zones";
  zones.setAttribute("aria-hidden", "true");
  zones.innerHTML = `
    <div class="chair-interaction-zone" data-gesture-zone="chair"></div>
    <div class="page-scroll-zone" data-gesture-zone="scroll"></div>
  `;
  app.append(zones);
}

function ensureGestureHint(app: HTMLElement): void {
  if (app.querySelector(".mobile-swipe-cue")) return;
  const cue = document.createElement("div");
  cue.className = "mobile-swipe-cue";
  cue.setAttribute("aria-hidden", "true");
  cue.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 4v13" />
      <path d="m7.5 12.5 4.5 4.5 4.5-4.5" />
    </svg>
    <span>拖动椅子查看 · 下滑浏览下一把</span>
  `;
  app.append(cue);
}

function replaceHomeButtonsWithBack(): void {
  document
    .querySelectorAll<HTMLButtonElement>('.prototype-ui .prototype-topbar [data-action="home"]')
    .forEach((button) => {
      if (button.dataset.codexBackIcon === "true") return;
      button.dataset.codexBackIcon = "true";
      button.setAttribute("aria-label", "返回");
      button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7" />
        </svg>
      `;
    });
}

function syncRuntimeChrome(): void {
  const app = prototypeApp();
  if (!app) return;
  ensureIntroEntry(app);
  ensureGestureZones(app);
  ensureGestureHint(app);
  replaceHomeButtonsWithBack();

  const stage = app.dataset.appStage || "";
  if (stage !== previousStage) {
    if (stage === "scene-showcase") updateSceneVisual(app, 0);
    if (stage === "main") showGestureHintOnce(app);
    previousStage = stage;
  }
}

document.addEventListener("pointerdown", onPointerDown, true);
document.addEventListener("pointermove", onPointerMove, { capture: true, passive: false });
document.addEventListener("pointerup", onPointerUp, true);
document.addEventListener("pointercancel", onPointerCancel, true);
document.addEventListener("wheel", onWheelCapture, { capture: true, passive: false });

new MutationObserver(syncRuntimeChrome).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["data-app-stage", "data-view", "data-cover-stage"],
});

syncRuntimeChrome();

export {};
