import chairTreeSvg from "./assets/endlessform_chair_tree_v2.svg?raw";
import {
  createChairGenealogy,
  type ChairGenealogyController,
  type ChairSelection,
} from "./p0/createChairGenealogy";
import "./styles/chair-genealogy.css";

let activeHost: HTMLElement | null = null;
let activeController: ChairGenealogyController | null = null;
let activeSortIndex = 0;

const sortModes = [
  { label: "家族图谱", focus: null },
  { label: "按上新时间", focus: "hub-top-main" },
  { label: "按热度", focus: "hub-right-main" },
  { label: "按收藏", focus: "hub-bottom-main" },
] as const;

const sortIconMarkup = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 18V9" />
    <path d="M12 18V6" />
    <path d="M17 18v-4" />
    <path d="M5 18h14" />
  </svg>
`;

function detailMarkup(selection: ChairSelection): string {
  return `
    <div class="chair-tree-detail__backdrop" data-chair-tree-close></div>
    <aside class="chair-tree-detail__sheet" role="dialog" aria-modal="true" aria-label="椅子节点信息">
      <button type="button" class="chair-tree-detail__close" data-chair-tree-close aria-label="关闭">×</button>
      <span>CHAIR NODE</span>
      <strong>${selection.chairSymbol || "—"}</strong>
      <small>${selection.id}</small>
    </aside>
  `;
}

function showSelection(host: HTMLElement, selection: ChairSelection): void {
  let detail = host.querySelector<HTMLElement>(".chair-tree-detail");
  if (!detail) {
    detail = document.createElement("div");
    detail.className = "chair-tree-detail";
    host.append(detail);
  }

  detail.innerHTML = detailMarkup(selection);
  detail.dataset.open = "true";
  detail.querySelectorAll<HTMLElement>("[data-chair-tree-close]").forEach((button) => {
    button.addEventListener("click", () => {
      delete detail?.dataset.open;
    });
  });
}

function destroyActiveTree(): void {
  activeController?.destroy();
  activeController = null;
  activeHost = null;
}

function ensureBackButton(shell: HTMLElement): void {
  const homeButton = shell.querySelector<HTMLButtonElement>(
    '.prototype-topbar [data-action="home"]',
  );
  if (!homeButton || homeButton.dataset.chairTreeBack === "true") return;

  homeButton.dataset.chairTreeBack = "true";
  homeButton.setAttribute("aria-label", "返回");
  homeButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5 8 12l7 7" />
    </svg>
  `;
}

function applySortMode(): void {
  if (!activeHost || !activeController) return;
  const mode = sortModes[activeSortIndex] ?? sortModes[0];
  activeHost.dataset.sortMode = String(activeSortIndex);
  const status = activeHost.querySelector<HTMLElement>(".chair-tree__status");
  if (status) {
    status.textContent =
      activeSortIndex === 0 ? "拖动浏览 · 双指缩放 · 点击椅子聚焦" : `当前排序：${mode.label}`;
  }

  if (status) {
    status.textContent =
      activeSortIndex === 0 ? "滑动浏览 · 双指缩放 · 点击椅子聚焦" : `当前排序：${mode.label}`;
  }

  if (mode.focus) activeController.focusNode(mode.focus);
  else activeController.reset();

  const refreshedStatus = activeHost.querySelector<HTMLElement>(".chair-tree__status");
  if (refreshedStatus) {
    refreshedStatus.textContent =
      activeSortIndex === 0 ? "滑动浏览 · 双指缩放 · 点击椅子聚焦" : `当前排序：${mode.label}`;
  }
}

function ensureSortControls(shell: HTMLElement): void {
  let button = shell.querySelector<HTMLButtonElement>("[data-chair-tree-sort-toggle]");
  let sheet = shell.querySelector<HTMLElement>(".chair-tree-sort-sheet");

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "chair-tree-sort-toggle";
    button.dataset.chairTreeSortToggle = "true";
    button.setAttribute("aria-label", "切换排序类型");
  }
  if (button.parentElement !== shell) shell.append(button);

  if (!sheet) {
    sheet = document.createElement("section");
    sheet.className = "chair-tree-sort-sheet";
    sheet.hidden = true;
    sheet.innerHTML = `
      <h2>选择排序类型</h2>
      ${sortModes
        .map(
          (mode, index) => `
            <button type="button" data-chair-tree-sort-index="${index}">
              ${mode.label}
            </button>
          `,
        )
        .join("")}
    `;
    shell.append(sheet);
  }
  const heading = sheet.querySelector("h2");
  if (heading) heading.textContent = "选择排序类型";

  const refresh = (): void => {
    const mode = sortModes[activeSortIndex] ?? sortModes[0];
    button.innerHTML = sortIconMarkup;
    button.title = mode.label;
    button.setAttribute("aria-label", `切换排序类型：${mode.label}`);
    sheet
      .querySelectorAll<HTMLButtonElement>("[data-chair-tree-sort-index]")
      .forEach((item) => {
        item.classList.toggle(
          "is-selected",
          Number(item.dataset.chairTreeSortIndex) === activeSortIndex,
        );
      });
  };

  if (!button.dataset.bound) {
    button.dataset.bound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      sheet.hidden = !sheet.hidden;
    });
  }

  sheet.querySelectorAll<HTMLButtonElement>("[data-chair-tree-sort-index]").forEach((item) => {
    if (item.dataset.bound) return;
    item.dataset.bound = "true";
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      activeSortIndex = Number(item.dataset.chairTreeSortIndex || 0);
      sheet.hidden = true;
      refresh();
      applySortMode();
    });
  });

  refresh();
}

function mountTree(): void {
  const shell = document.querySelector<HTMLElement>('.prototype-ui[data-view="graph"]');
  const oldBoard = shell?.querySelector<HTMLElement>(".graph-tree-board");

  if (!shell || !oldBoard) {
    if (activeHost && !activeHost.isConnected) destroyActiveTree();
    return;
  }

  if (activeHost?.isConnected) {
    ensureBackButton(shell);
    ensureSortControls(shell);
    return;
  }
  destroyActiveTree();

  const host = document.createElement("section");
  host.id = "chair-tree";
  host.setAttribute("aria-label", "EndlessForm 椅子知识图谱");
  ["pointerdown", "pointermove", "pointerup", "pointercancel"].forEach((eventName) => {
    host.addEventListener(eventName, (event) => {
      event.stopPropagation();
    });
  });
  oldBoard.replaceWith(host);
  ensureBackButton(shell);

  activeHost = host;
  activeController = createChairGenealogy(host, chairTreeSvg, {
    animateOnMount: true,
    initialScale: 1.42,
    minScale: 0.72,
    maxScale: 3.4,
    onChairSelect(selection) {
      if (selection.role === "leaf") showSelection(host, selection);
    },
  });
  ensureSortControls(shell);
  applySortMode();
}

const observer = new MutationObserver(() => mountTree());
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["data-view"],
});

mountTree();
