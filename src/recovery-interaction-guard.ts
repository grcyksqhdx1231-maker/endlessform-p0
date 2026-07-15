const interactiveSelector = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "[role='button']",
  "[data-action]",
  "[data-nav]",
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
  .prototype-ui .bottom-nav {
    z-index: 42 !important;
    pointer-events: auto !important;
  }

  .prototype-ui .bottom-nav button,
  .prototype-ui .page-bottom-nav button,
  .prototype-ui .top-custom-button,
  .prototype-ui .action-rail button {
    pointer-events: auto !important;
  }

  .prototype-ui[data-view="favorites"] .page-bottom-nav {
    display: none !important;
    pointer-events: none !important;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .action-rail {
    top: auto !important;
    right: 27px !important;
    bottom: calc(env(safe-area-inset-bottom) + 152px) !important;
  }

  .prototype-ui .mobile-swipe-cue {
    position: absolute;
    z-index: 18;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom) + 156px);
    width: 28px;
    height: 28px;
    display: none;
    place-items: center;
    color: #686864;
    pointer-events: none;
    transform: translateX(-50%);
  }

  .prototype-ui .mobile-swipe-cue svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"]:not([data-view]) .mobile-swipe-cue,
  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"][data-view="home"] .mobile-swipe-cue {
    display: grid;
    animation: mobile-swipe-cue-bounce 1.35s ease-in-out infinite;
  }

  .prototype-ui[data-codex-ai-open="true"] .mobile-swipe-cue,
  .prototype-ui[data-feed-mode="composer"] .mobile-swipe-cue {
    display: none !important;
  }

  @keyframes mobile-swipe-cue-bounce {
    0%, 100% { transform: translate(-50%, -4px); opacity: 0.55; }
    50% { transform: translate(-50%, 5px); opacity: 1; }
  }

  @media (max-width: 380px) {
    .prototype-ui[data-app-stage="main"][data-cover-stage="feed"] .action-rail {
      right: 18px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .prototype-ui .mobile-swipe-cue {
      animation: none !important;
    }
  }

  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"]:not([data-view]) [data-ui-interactive],
  .prototype-ui[data-app-stage="main"][data-cover-stage="feed"][data-view="home"] [data-ui-interactive] {
    touch-action: none !important;
  }

  .prototype-ui .prototype-topbar [data-action="home"] svg {
    fill: none !important;
    stroke: currentColor !important;
    stroke-width: 1.8px !important;
    stroke-linecap: round !important;
    stroke-linejoin: round !important;
  }
`;
document.head.append(style);

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

function ensureSwipeCue(): void {
  const app = document.getElementById("app");
  if (!app?.classList.contains("prototype-ui")) return;
  if (app.querySelector(".mobile-swipe-cue")) return;

  const cue = document.createElement("div");
  cue.className = "mobile-swipe-cue";
  cue.setAttribute("aria-hidden", "true");
  cue.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 4v13" />
      <path d="m7.5 12.5 4.5 4.5 4.5-4.5" />
    </svg>
  `;
  app.append(cue);
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(interactiveSelector));
}

function guardPrototypeGesture(event: PointerEvent): void {
  const app = document.getElementById("app");
  if (!app?.classList.contains("prototype-ui")) return;
  if (!isInteractiveTarget(event.target)) return;
  event.stopPropagation();
}

document.addEventListener("pointerdown", guardPrototypeGesture, true);
document.addEventListener("pointerup", guardPrototypeGesture, true);
document.addEventListener("pointercancel", guardPrototypeGesture, true);

function refreshInteractionChrome(): void {
  replaceHomeButtonsWithBack();
  ensureSwipeCue();
}

new MutationObserver(refreshInteractionChrome).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
refreshInteractionChrome();
