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

new MutationObserver(replaceHomeButtonsWithBack).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
replaceHomeButtonsWithBack();
