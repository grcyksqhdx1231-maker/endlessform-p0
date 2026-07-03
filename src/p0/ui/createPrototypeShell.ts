import { gsap } from "gsap";
import type { ChairRotationController } from "../interaction/createChairRotationController";
import type { P0Overlay } from "./createP0Overlay";

interface PrototypeShellOptions {
  root: HTMLElement;
  overlay: P0Overlay;
  rotation: ChairRotationController;
  reducedMotion: boolean;
  onChairModelChange?: (modelUrl: string) => void;
}

type ViewName = "home" | "about" | "about-detail" | "graph" | "detail" | "shop" | "custom" | "favorites" | "profile" | "ai";

const feedItems = [
  { id: "P0", title: "潮汐系列 静湾椅", story: "带给人海洋般的静谧感，适合独自思考的时间。" },
  { id: "R1", title: "月影系列 栖光椅", story: "像夜晚窗边落下的一束柔光，适合卧室、阅读和低声交谈。" },
  { id: "R2", title: "岩层系列 折面椅", story: "形体像被时间切开的岩层，适合放在展厅或客厅成为视觉中心。" },
  { id: "R3", title: "心迹系列 环抱椅", story: "把柔软、靠近和被包裹的感觉转译成连续的结构。" },
  { id: "AI", title: "AI 重新推荐", story: "输入一句话，我只为你重新生成一把更贴近意图的椅子。" },
  { id: "R4", title: "工坊系列 算法椅", story: "理性、克制、有清晰的数字制造痕迹，适合工作室和创作空间。" },
  { id: "R5", title: "星屿系列 收藏椅", story: "保留数字生成的折面变化，适合安静陈列，也适合继续收藏比较。" },
  { id: "R6", title: "家族图谱 谱系椅", story: "继续向下探索，你会看到这些椅子如何互相关联又各成系列。" },
];

const guideTags = [
  "告诉我：我想要一把卧室里的椅子",
  "我想要一把心型的椅子",
  "适合展厅和作品陈列",
  "更有科技感和数字制造感",
  "适合安静阅读角",
];

const intentTags = [
  "卧室",
  "心型",
  "展厅陈列",
  "数字制造",
  "柔软安全感",
  "收藏级",
];

const detailTabs = ["故事", "概念", "工艺", "实物", "展览", "报道"];

const graphPrimaryNodes = [
  { className: "graph-node-main", label: "当前推荐", image: "/assets/endlessform/ef-02.jpg" },
  { className: "graph-node-a", label: "柔和居住", image: "/assets/endlessform/ef-03.jpg" },
  { className: "graph-node-b", label: "形体系列", image: "/assets/endlessform/ef-09.jpg" },
  { className: "graph-node-c", label: "数字制造", image: "/assets/endlessform/ef-12.jpg" },
  { className: "graph-node-d", label: "系列关联", image: "/assets/endlessform/ef-16.jpg" },
];

const graphLeafNodes = [
  { className: "graph-leaf-a1", label: "静湾椅", image: "/assets/endlessform/ef-03.jpg" },
  { className: "graph-leaf-a2", label: "栖光椅", image: "/assets/endlessform/ef-05.jpg" },
  { className: "graph-leaf-a3", label: "月影椅", image: "/assets/endlessform/ef-06.jpg" },
  { className: "graph-leaf-b1", label: "折面椅", image: "/assets/endlessform/ef-09.jpg" },
  { className: "graph-leaf-b2", label: "环抱椅", image: "/assets/endlessform/ef-10.jpg" },
  { className: "graph-leaf-b3", label: "展场椅", image: "/assets/endlessform/ef-11.jpg" },
  { className: "graph-leaf-c1", label: "算法椅", image: "/assets/endlessform/ef-12.jpg" },
  { className: "graph-leaf-c2", label: "结构椅", image: "/assets/endlessform/ef-13.jpg" },
  { className: "graph-leaf-c3", label: "矩阵椅", image: "/assets/endlessform/ef-14.jpg" },
  { className: "graph-leaf-d1", label: "收藏椅", image: "/assets/endlessform/ef-15.jpg" },
  { className: "graph-leaf-d2", label: "谱系椅", image: "/assets/endlessform/ef-16.jpg" },
  { className: "graph-leaf-d3", label: "延展椅", image: "/assets/endlessform/ef-01.jpg" },
];

const graphChairCards = [
  { name: "静湾椅", image: "/assets/endlessform/ef-03.jpg", favorites: 128 },
  { name: "栖光椅", image: "/assets/endlessform/ef-05.jpg", favorites: 96 },
  { name: "月影椅", image: "/assets/endlessform/ef-06.jpg", favorites: 142 },
  { name: "折面椅", image: "/assets/endlessform/ef-09.jpg", favorites: 211 },
  { name: "环抱椅", image: "/assets/endlessform/ef-10.jpg", favorites: 176 },
  { name: "展场椅", image: "/assets/endlessform/ef-11.jpg", favorites: 88 },
  { name: "算法椅", image: "/assets/endlessform/ef-12.jpg", favorites: 264 },
  { name: "结构椅", image: "/assets/endlessform/ef-13.jpg", favorites: 153 },
  { name: "矩阵椅", image: "/assets/endlessform/ef-14.jpg", favorites: 189 },
  { name: "收藏椅", image: "/assets/endlessform/ef-15.jpg", favorites: 317 },
  { name: "谱系椅", image: "/assets/endlessform/ef-16.jpg", favorites: 124 },
  { name: "延展椅", image: "/assets/endlessform/ef-01.jpg", favorites: 201 },
];

function chairViewSet(slug: string) {
  return {
    left: `/assets/model-views/${slug}-left.png`,
    front: `/assets/model-views/${slug}-front.png`,
    right: `/assets/model-views/${slug}-right.png`,
  };
}

const favoriteCards = [
  { name: "静湾椅", series: "潮汐系列", image: "/assets/endlessform/ef-03.jpg", views: chairViewSet("chair-01"), modelUrl: "/models/p0-chair.glb", favorites: 128, sold: 17, price: "￥12300元" },
  { name: "折面椅", series: "岩层系列", image: "/assets/endlessform/ef-09.jpg", views: chairViewSet("chair-02"), modelUrl: "/models/chair-model-02.glb", favorites: 211, sold: 42, price: "￥12300元" },
  { name: "环抱椅", series: "心迹系列", image: "/assets/endlessform/ef-10.jpg", views: chairViewSet("chair-03"), modelUrl: "/models/chair-model-03.glb", favorites: 176, sold: 9, price: "￥12300元" },
  { name: "算法椅", series: "工坊系列", image: "/assets/endlessform/ef-12.jpg", views: chairViewSet("chair-04"), modelUrl: "/models/chair-model-04.glb", favorites: 264, sold: 68, price: "￥12300元" },
  { name: "收藏椅", series: "星屿系列", image: "/assets/endlessform/ef-15.jpg", views: chairViewSet("chair-05"), modelUrl: "/models/chair-model-05.glb", favorites: 317, sold: 35, price: "￥12300元" },
  { name: "谱系椅", series: "家族图谱", image: "/assets/endlessform/ef-16.jpg", views: chairViewSet("chair-06"), modelUrl: "/models/chair-model-06.glb", favorites: 124, sold: 83, price: "￥12300元" },
  { name: "栖光椅", series: "月影系列", image: "/assets/endlessform/ef-05.jpg", views: chairViewSet("chair-07"), modelUrl: "/models/chair-model-01.glb", favorites: 96, sold: 27, price: "￥12300元" },
  { name: "月影椅", series: "月影系列", image: "/assets/endlessform/ef-06.jpg", views: chairViewSet("chair-08"), modelUrl: "/models/chair-model-07.glb", favorites: 142, sold: 58, price: "￥12300元" },
  { name: "结构椅", series: "数字制造", image: "/assets/endlessform/ef-13.jpg", views: chairViewSet("chair-09"), modelUrl: "/models/chair-model-08.glb", favorites: 153, sold: 74, price: "￥12300元" },
  { name: "矩阵椅", series: "数字制造", image: "/assets/endlessform/ef-14.jpg", views: chairViewSet("chair-10"), modelUrl: "/models/chair-model-09.glb", favorites: 189, sold: 21, price: "￥12300元" },
  { name: "展场椅", series: "展览系列", image: "/assets/endlessform/ef-11.jpg", views: chairViewSet("chair-11"), modelUrl: "/models/chair-model-10.glb", favorites: 88, sold: 49, price: "￥12300元" },
  { name: "延展椅", series: "系列关联", image: "/assets/endlessform/ef-01.jpg", views: chairViewSet("chair-12"), modelUrl: "/models/chair-model-11.glb", favorites: 201, sold: 62, price: "￥12300元" },
];

type FavoriteCard = (typeof favoriteCards)[number];

function chairFromText(text = ""): FavoriteCard | undefined {
  return favoriteCards.find((card) => text.includes(card.name) || text.includes(card.series));
}

function chairFromImage(image = ""): FavoriteCard | undefined {
  return favoriteCards.find((card) => card.image === image);
}

function favoriteIndexForTarget(label = "", image = "", className = ""): number {
  const exactCard = chairFromText(label) || chairFromImage(image);
  if (exactCard) return favoriteCards.indexOf(exactCard);
  if (className.includes("graph-node-a")) return 0;
  if (className.includes("graph-node-b")) return 1;
  if (className.includes("graph-node-c")) return 3;
  if (className.includes("graph-node-d")) return 5;
  return 0;
}

function graphImageForTarget(label = "", image = "", className = ""): string {
  return favoriteCards[favoriteIndexForTarget(label, image, className)]?.views.front || image;
}

const aboutFeatureSections = [
  {
    title: "总览",
    meta: "Overview",
    image: "/assets/endlessform/ef-02.jpg",
    body: "围绕 EndlessForm 的形体语言、数字制造、收藏路径和展览档案建立统一入口。",
    detail: "这里将放 EndlessForm 的品牌总览、核心体验路径和内容索引。",
  },
  {
    title: "形体美学与收藏价值",
    meta: "Aesthetics",
    image: "/assets/endlessform/ef-07.jpg",
    body: "从生成形体、观看距离和空间氛围解释椅子的视觉吸引力。",
    detail: "这里将放椅子的造型语言、收藏理由、空间陈列和设计叙事。",
  },
  {
    title: "参数化设计与数字制造",
    meta: "Fabrication",
    image: "/assets/endlessform/ef-08.jpg",
    body: "以参数生成、结构推演和小批量制造解释 EndlessForm 的数字家具语言。",
    detail: "这里将放参数生成、结构演化、制造流程和材料工艺说明。",
  },
  {
    title: "研发脉络",
    meta: "Timeline",
    image: "/assets/endlessform/ef-12.jpg",
    body: "以时间轴梳理长期研究、实验迭代和产品化节点。",
    detail: "这里将放研发时间线、关键节点、实验版本和产品化过程。",
  },
  {
    title: "展览、媒体与奖项档案",
    meta: "Archive",
    image: "/assets/endlessform/ef-11.jpg",
    body: "集中展示展览现场、媒体报道和获奖线索，形成内容证据链。",
    detail: "这里将放展览现场、媒体报道、奖项记录和外部资料入口。",
  },
];

export interface PrototypeShell {
  dispose: () => void;
}

function iconSvg(name: string): string {
  if (name === "paper-plane") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 11.7 19 5.5 13.1 20l-2.4-6.3-6.2-2Z" /><path d="m10.8 13.5 3.4-3.5" /></svg>`;
  }
  if (name === "graph") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h4m4 0h4M8 7v5m8-5v5M5 17h6m2 0h6M8 12l-1.5 5M16 12l1.5 5" /></svg>`;
  }
  if (name === "chair-param") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5c3 1 5 1 8 0M7 9c4 1.3 7 1.3 10 0M8 13h8M8 13l-2 6M16 13l2 6M9 17h6" /><circle cx="8" cy="5" r="1.2" /><circle cx="16" cy="5" r="1.2" /><circle cx="7" cy="9" r="1.2" /><circle cx="17" cy="9" r="1.2" /></svg>`;
  }
  if (name === "home") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5M7 10v9h10v-9" /></svg>`;
  }
  if (name === "bag") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9h10l1 10H6L7 9Z" /><path d="M9 9a3 3 0 0 1 6 0" /></svg>`;
  }
  if (name === "heart") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19s-7-4.6-7-9.2A3.8 3.8 0 0 1 12 7.7 3.8 3.8 0 0 1 19 9.8C19 14.4 12 19 12 19Z" /></svg>`;
  }
  if (name === "about") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17v-6" /><path d="M12 7h.01" /><circle cx="12" cy="12" r="8" /></svg>`;
  }
  if (name === "robot") {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="9" width="11" height="8.5" rx="3" /><path d="M12 9V6.5" /><path d="M9.5 12.5h.01M14.5 12.5h.01" /><path d="M5 13h1.5M17.5 13H19" /></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 18c1.2-2 6.8-2 8 0" /><circle cx="12" cy="9" r="3" /></svg>`;
}

function createButton(className: string, label: string, html: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.setAttribute("aria-label", label);
  button.dataset.uiInteractive = "true";
  button.innerHTML = html;
  return button;
}

export function createPrototypeShell(options: PrototypeShellOptions): PrototypeShell {
  const { root, overlay, rotation, reducedMotion } = options;
  let feedIndex = 0;
  let recommendationCount = 1;
  let view: ViewName = "home";
  let sortModeIndex = 0;
  let favorite = false;
  let activeDetailTab = 0;
  let activeAboutSection = aboutFeatureSections[0];
  let selectedShopItem = favoriteCards[0];
  let graphHintDismissed = false;
  let pointerStart: { x: number; y: number; target: EventTarget | null } | null = null;
  let lastWheelAt = 0;
  let autoRotateTimer = 0;
  let autoRotationAngle = 0;
  let transitionActive = false;

  root.classList.add("prototype-ui");
  root.dataset.prototypeCopyLock = "true";
  root.dataset.feedMode = "recommend";
  root.dataset.graphHint = "hidden";
  root.dataset.chromeReady = "false";

  const chairCard = document.createElement("section");
  chairCard.className = "chair-feed-card";
  chairCard.setAttribute("aria-hidden", "true");

  const actionRail = document.createElement("aside");
  actionRail.className = "action-rail";
  actionRail.dataset.uiInteractive = "true";

  const favoriteButton = createButton("round-action", "收藏这把椅子", "♡");
  const detailButton = createButton("round-action", "查看椅子信息", "!");
  actionRail.append(favoriteButton, detailButton);

  const topCustomButton = createButton("top-custom-button", "参数化定制", iconSvg("chair-param"));

  const feedMeta = document.createElement("section");
  feedMeta.className = "feed-meta";
  feedMeta.dataset.uiInteractive = "true";

  const feedTitle = document.createElement("h1");
  feedTitle.className = "feed-title";
  const feedStory = document.createElement("p");
  feedStory.className = "feed-story";
  const feedCount = document.createElement("p");
  feedCount.className = "feed-count";
  feedMeta.append(feedCount, feedTitle, feedStory);

  const composer = document.createElement("section");
  composer.className = "ai-composer";
  composer.dataset.uiInteractive = "true";
  composer.innerHTML = `
    <div class="composer-input-row">
      <input class="composer-input" type="text" placeholder="我可以帮你做什么" />
      <button class="send-button" type="button" aria-label="发送">${iconSvg("paper-plane")}</button>
    </div>
    <div class="composer-tags"></div>
  `;

  const composerInput = composer.querySelector<HTMLInputElement>(".composer-input");
  const composerTags = composer.querySelector<HTMLElement>(".composer-tags");
  const sendButton = composer.querySelector<HTMLButtonElement>(".send-button");

  const graphPrompt = document.createElement("p");
  graphPrompt.className = "graph-prompt";
  graphPrompt.textContent = "点击进入椅子知识图谱";

  const cardIndicator = document.createElement("div");
  cardIndicator.className = "feed-card-indicator";
  cardIndicator.setAttribute("aria-hidden", "true");
  cardIndicator.innerHTML = feedItems.map((_, index) => `<span data-feed-dot="${index}"></span>`).join("");

  const bottomNav = document.createElement("nav");
  bottomNav.className = "bottom-nav";
  bottomNav.dataset.uiInteractive = "true";
  bottomNav.setAttribute("aria-label", "主导航");
  bottomNav.innerHTML = `
    <button type="button" data-nav="about" data-action="about">${iconSvg("about")}<span>About</span></button>
    <button type="button" data-nav="graph" data-action="graph">${iconSvg("graph")}<span>图谱</span></button>
    <button type="button" data-nav="ai" data-action="ai">${iconSvg("robot")}<span>AI</span></button>
    <button type="button" data-nav="favorites" data-action="favorites">${iconSvg("heart")}<span>收藏</span></button>
    <button type="button" data-nav="profile" data-action="profile">${iconSvg("profile")}<span>我的</span></button>
  `;

  const pageLayer = document.createElement("section");
  pageLayer.className = "prototype-page-layer";
  pageLayer.dataset.uiInteractive = "true";
  pageLayer.hidden = true;

  root.append(chairCard, topCustomButton, actionRail, feedMeta, composer, graphPrompt, cardIndicator, bottomNav, pageLayer);

  window.setTimeout(() => {
    root.dataset.chromeReady = "true";
    startAutoRotate();
  }, reducedMotion ? 80 : 2200);

  function stopAutoRotate(): void {
    if (autoRotateTimer) {
      window.clearInterval(autoRotateTimer);
      autoRotateTimer = 0;
    }
  }

  function startAutoRotate(): void {
    stopAutoRotate();
    if (view !== "home" || activeItem().id === "AI") return;
    autoRotationAngle = (feedIndex % 5) * ((Math.PI * 2) / 5);
    autoRotateTimer = window.setInterval(() => {
      if (transitionActive || view !== "home") return;
      autoRotationAngle += 0.006;
      rotation.setAngle(autoRotationAngle, false);
    }, 50);
  }

  function cardMotionNodes(): HTMLElement[] {
    return [
      chairCard,
      feedMeta,
      actionRail,
      root.querySelector<HTMLElement>(".ai-dialogue"),
      root.querySelector<HTMLElement>(".p0-canvas"),
    ].filter((node): node is HTMLElement => Boolean(node));
  }

  function activeItem() {
    return feedItems[((feedIndex % feedItems.length) + feedItems.length) % feedItems.length];
  }

  function activeChair(): FavoriteCard {
    const item = activeItem();
    if (feedIndex < feedItems.length) {
      return chairFromText(item.title) || favoriteCards[((feedIndex % favoriteCards.length) + favoriteCards.length) % favoriteCards.length];
    }
    return favoriteCards[((feedIndex % favoriteCards.length) + favoriteCards.length) % favoriteCards.length];
  }

  function selectActiveChair(): void {
    selectedShopItem = activeChair();
  }

  function setComposerTags(tags: string[]): void {
    if (!composerTags || !composerInput) return;
    composerTags.innerHTML = "";
    tags.forEach((tag) => {
      const tagButton = document.createElement("button");
      tagButton.type = "button";
      tagButton.textContent = tag;
      tagButton.addEventListener("click", () => {
        composerInput.value = tag.replace(/^告诉我：/, "");
        setComposerTags(intentTags);
      });
      composerTags.append(tagButton);
    });
  }

  function renderFeed(): void {
    const item = activeItem();
    selectedShopItem = activeChair();
    options.onChairModelChange?.(selectedShopItem.modelUrl);
    const isComposer = item.id === "AI";
    const isGraphPrompt = !graphHintDismissed && recommendationCount >= 5;
    root.dataset.feedMode = isComposer ? "composer" : "recommend";
    root.dataset.graphHint = isGraphPrompt ? "visible" : "hidden";
    feedTitle.textContent = isComposer ? item.title : `${selectedShopItem.series} ${selectedShopItem.name}`;
    feedStory.textContent = item.story;
    feedCount.textContent = "猜你喜欢";
    cardIndicator.querySelectorAll<HTMLElement>("[data-feed-dot]").forEach((dot) => {
      dot.classList.toggle("is-active", Number(dot.dataset.feedDot) === (((feedIndex % feedItems.length) + feedItems.length) % feedItems.length));
    });

    if (isComposer) {
      overlay.setPrototypeCopy("我可以帮你做什么");
      setComposerTags(guideTags);
    } else if (isGraphPrompt) {
      overlay.setPrototypeCopy("我为您推荐了一把椅子，点击查看详情");
    } else {
      overlay.setPrototypeCopy("我为您推荐了一把椅子，点击查看详情");
    }

    const targetState = ((feedIndex % 5) + 5) % 5;
    rotation.snapToState(targetState, !reducedMotion);
  }

  function openView(nextView: ViewName): void {
    view = nextView;
    root.dataset.view = view;
    pageLayer.hidden = view === "home";
    if (view === "home") {
      pageLayer.innerHTML = "";
      renderFeed();
      return;
    }
    pageLayer.innerHTML = renderView(view);
    bindPageActions();
    animatePageIn(view);
    if (view === "shop") centerPurchaseViewer();
  }

  function renderView(targetView: ViewName): string {
    if (targetView === "graph") return renderGraph();
    if (targetView === "detail") return renderDetail();
    if (targetView === "about-detail") return renderAboutDetail();
    if (targetView === "shop") return renderShop();
    if (targetView === "custom") return renderCustom();
    if (targetView === "favorites") return renderFavorites();
    if (targetView === "profile") return renderProfile();
    return renderAbout();
  }

  function openAiComposer(): void {
    view = "home";
    root.dataset.view = view;
    pageLayer.hidden = true;
    pageLayer.innerHTML = "";
    feedIndex = 4;
    renderFeed();
    composerInput?.focus({ preventScroll: true });
  }

  function topbar(title: string, right = ""): string {
    return `
      <header class="prototype-topbar">
        <button type="button" data-action="home" aria-label="回到首页">${iconSvg("home")}</button>
        <strong>${title === "购买" ? `${iconSvg("bag")}<span>购买</span>` : title}</strong>
        ${right || "<span></span>"}
      </header>
    `;
  }

  function pageBottomNav(active: ViewName): string {
    const items: Array<{ key: ViewName; label: string; icon: string }> = [
      { key: "about", label: "About", icon: "about" },
      { key: "graph", label: "图谱", icon: "graph" },
      { key: "ai", label: "AI", icon: "robot" },
      { key: "favorites", label: "收藏", icon: "heart" },
      { key: "profile", label: "我的", icon: "profile" },
    ];
    return `
      <nav class="page-bottom-nav" aria-label="页面导航">
        ${items.map((item) => `
          <button type="button" data-action="${item.key}" class="${item.key === active ? "is-active" : ""}">
            ${iconSvg(item.icon)}
            <span>${item.label}</span>
          </button>
        `).join("")}
      </nav>
    `;
  }

  function renderAbout(): string {
    return `
      ${topbar("About / 内容")}
      <div class="prototype-scroll about-flow">
        <button class="about-hero" type="button" data-action="about-detail" data-about-index="0">
          <img src="/assets/endlessform/ef-06.jpg" alt="EndlessForm 展示图" />
          <span>EndlessForm Archive</span>
          <h2>椅子的故事、工艺与知识档案</h2>
          <p>浏览 EndlessForm 的形体语言、制造逻辑、收藏信息与展览档案。</p>
        </button>
        ${aboutFeatureSections.slice(1).map((section) => `
          <button class="about-card" type="button" data-action="about-detail" data-about-index="${aboutFeatureSections.indexOf(section)}">
            <img src="${section.image}" alt="${section.title}" />
            <span>${section.meta}</span>
            <h2>${section.title}</h2>
            <p>${section.body}</p>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderAboutDetail(): string {
    return `
      ${topbar(activeAboutSection.title)}
      <div class="prototype-scroll about-detail-page">
        <section class="about-detail-hero">
          <img src="${activeAboutSection.image}" alt="${activeAboutSection.title}" />
          <span>${activeAboutSection.meta}</span>
          <h2>${activeAboutSection.title}</h2>
        </section>
        <section class="lofi-section">
          <p>${activeAboutSection.detail}</p>
        </section>
      </div>
    `;
  }

  function renderGraph(): string {
    const modes = ["家族图谱", "按上新时间", "按热度", "按收藏"];
    const mode = modes[sortModeIndex % modes.length];
    const isTreeMode = sortModeIndex % modes.length === 0;
    return `
      ${topbar("椅子知识图谱", `<button type="button" data-action="sort-menu">${mode}</button>`)}
      ${isTreeMode ? renderGraphTree(mode) : renderGraphWaterfall(mode, sortModeIndex % modes.length)}
      <section class="sort-sheet" hidden>
        <h2>选择图谱排序</h2>
        ${modes.map((item, index) => `
          <button type="button" data-sort-index="${index}" class="${index === sortModeIndex % modes.length ? "is-selected" : ""}">
            ${item}
          </button>
        `).join("")}
      </section>
    `;
  }

  function renderGraphTree(mode: string): string {
    return `
      <div class="graph-board graph-tree-board">
        <svg class="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 38 C42 31 33 25 24 22" />
          <path d="M50 38 C58 31 67 25 76 22" />
          <path d="M50 38 C42 50 33 60 24 68" />
          <path d="M50 38 C58 50 67 60 76 68" />
          <path d="M24 22 C20 17 15 13 10 10" />
          <path d="M24 22 C24 17 24 12 24 8" />
          <path d="M24 22 C29 17 34 14 38 12" />
          <path d="M76 22 C71 17 66 14 62 12" />
          <path d="M76 22 C76 17 76 12 76 8" />
          <path d="M76 22 C81 17 86 13 90 11" />
          <path d="M24 68 C19 63 14 59 10 56" />
          <path d="M24 68 C24 74 24 80 24 86" />
          <path d="M24 68 C29 74 34 78 39 81" />
          <path d="M76 68 C71 74 66 78 61 81" />
          <path d="M76 68 C76 74 76 80 76 86" />
          <path d="M76 68 C81 63 86 59 90 56" />
        </svg>
        ${graphPrimaryNodes.map((node) => {
          const isCurrent = node.className.includes("graph-node-main");
          const cardIndex = isCurrent ? favoriteCards.indexOf(selectedShopItem) : favoriteIndexForTarget(node.label, node.image, node.className);
          const image = isCurrent ? selectedShopItem.views.front : graphImageForTarget(node.label, node.image, node.className);
          const label = isCurrent ? selectedShopItem.name : node.label;
          return `
          <button class="graph-node ${node.className}" type="button" data-action="detail" data-card-index="${cardIndex}">
            <span><img src="${image}" alt="${label}" /></span>
            <strong>${label}</strong>
          </button>
        `;
        }).join("")}
        ${graphLeafNodes.map((node) => `
          <button class="graph-node graph-node-leaf ${node.className}" type="button" data-action="detail" data-card-index="${favoriteIndexForTarget(node.label, node.image, node.className)}">
            <span><img src="${graphImageForTarget(node.label, node.image, node.className)}" alt="${node.label}" /></span>
            <strong>${node.label}</strong>
          </button>
        `).join("")}
        <p class="graph-caption">当前模式：${mode}。一级为系列方向，二级为关联椅子。</p>
      </div>
    `;
  }

  function renderGraphWaterfall(mode: string, modeIndex: number): string {
    const cards = [...graphChairCards];
    if (modeIndex === 1) cards.reverse();
    if (modeIndex === 2) cards.sort((a, b) => b.favorites - a.favorites);
    if (modeIndex === 3) cards.sort((a, b) => b.favorites - a.favorites).reverse();
    return `
      <div class="prototype-scroll graph-waterfall" aria-label="${mode}">
        <p class="graph-list-caption">当前排序：${mode}</p>
        <div class="graph-card-columns">
          ${cards.map((card, index) => `
            <button class="graph-chair-card graph-card-${index % 4}" type="button" data-action="detail" data-card-index="${favoriteIndexForTarget(card.name, card.image)}">
              <img src="${graphImageForTarget(card.name, card.image)}" alt="${card.name}" />
              <span>
                <strong>${card.name}</strong>
                <small>♡ ${card.favorites}</small>
              </span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderDetail(): string {
    const activeTab = detailTabs[activeDetailTab % detailTabs.length];
    const detailCard = selectedShopItem;
    const detailImages = [
      detailCard.views.front,
      detailCard.views.left,
      detailCard.views.right,
    ];
    return `
      ${topbar("椅子信息")}
      <div class="prototype-scroll detail-copy">
        <p class="detail-chip">EndlessForm / 当前推荐</p>
        <h2>${detailCard.series} ${detailCard.name}</h2>
        <p>EndlessForm 将数字生成方法带入家具设计：以算法生成形体，再通过小批量制作与手工定制把数字座椅落到真实空间中。</p>
        <div class="detail-image-hero" aria-label="当前推荐椅子图片">
          <img src="${detailImages[0]}" alt="${detailCard.name}" />
        </div>
        <div class="detail-image-strip" aria-label="当前椅子三视图">
          ${detailImages.map((image, index) => `<img src="${image}" alt="${detailCard.name} ${["正视图", "左视图", "右视图"][index]}" />`).join("")}
        </div>
        <div class="detail-tabs">
          ${detailTabs.map((tab, index) => `<button type="button" data-tab-index="${index}" class="${tab === activeTab ? "is-selected" : ""}">${tab}</button>`).join("")}
        </div>
        <section class="detail-panel">
          <h3>${activeTab}</h3>
          <p>${detailPanelCopy(activeTab)}</p>
        </section>
        <dl>
          <div><dt>品牌</dt><dd>EndlessForm</dd></div>
          <div><dt>来源</dt><dd>张周捷数字实验室</dd></div>
          <div><dt>正式推出</dt><dd>2018 年</dd></div>
          <div><dt>制作方式</dt><dd>数字生成与小批量手工定制</dd></div>
        </dl>
        <button class="wide-button ghost" type="button" data-action="favorites">加入收藏</button>
        <button class="wide-button" type="button" data-action="shop">进入购买页</button>
      </div>
    `;
  }

  function detailPanelCopy(tab: string): string {
    if (tab === "故事") return "EndlessForm 起源于张周捷数字实验室对数字艺术和家具制造的长期研究。它关注的不是单一款式复制，而是让每把椅子都保留算法生成后的差异。";
    if (tab === "概念") return "项目以参数化生成作为起点，把座椅的轮廓、折面和结构关系转化为可制造的数字家具。";
    if (tab === "工艺") return "公开资料显示，EndlessForm 面向量产化数字家具，同时提供小批量手工定制服务。具体材料、尺寸和交付方式仍以官方确认为准。";
    if (tab === "实物") return "当前正侧视图由对应 3D 模型渲染生成，用于确认这把椅子的形体方向与外观；最终材料、尺寸与交付信息仍以官方确认为准。";
    if (tab === "展览") return "EndlessForm 于 2018 年以数字家具品牌亮相，并通过成组座椅展示算法生成带来的形态差异。";
    return "可补充官方报道、展览记录和获奖信息；当前页面只保留已确认的品牌与项目背景。";
  }

  function renderShop(): string {
    return `
      ${topbar("购买")}
      <div class="prototype-scroll shop-page">
        <section class="purchase-stage">
          <div class="purchase-stage-head">
            <span>${selectedShopItem.series}</span>
            <h2>${selectedShopItem.name}</h2>
            <p>正视图为当前商品展示，左右滑动可查看侧向视图。</p>
          </div>
          <div class="purchase-viewer" aria-label="商品三视图">
            <article class="purchase-view-card is-side is-left-view" aria-label="左视图" data-purchase-view="0">
              <img src="${selectedShopItem.views.left}" alt="${selectedShopItem.name} 左视图" />
              <span>左视图</span>
            </article>
            <article class="purchase-view-card is-main" aria-label="正视图" data-purchase-view="1" data-purchase-main>
              <img src="${selectedShopItem.views.front}" alt="${selectedShopItem.name} 正视图" />
              <small>NEW</small>
              <span>正视图</span>
            </article>
            <article class="purchase-view-card is-side is-right-view" aria-label="右视图" data-purchase-view="2">
              <img src="${selectedShopItem.views.right}" alt="${selectedShopItem.name} 右视图" />
              <span>右视图</span>
            </article>
          </div>
          <div class="purchase-dots" aria-label="切换商品视图">
            <button type="button" data-purchase-dot="0" aria-label="切换到左视图"></button>
            <button class="is-active" type="button" data-purchase-dot="1" aria-label="切换到正视图"></button>
            <button type="button" data-purchase-dot="2" aria-label="切换到右视图"></button>
          </div>
        </section>
        <section class="purchase-summary">
          <div>
            <h2>${selectedShopItem.series} ${selectedShopItem.name}</h2>
            <p>已售 ${selectedShopItem.sold} · ♡ ${selectedShopItem.favorites}</p>
          </div>
          <strong>${selectedShopItem.price.replace("元", "")}</strong>
        </section>
        <div class="purchase-actions">
          <button class="purchase-favorite ${favorite ? "is-active" : ""}" type="button" data-action="toggle-favorite" aria-label="收藏这把椅子" aria-pressed="${favorite ? "true" : "false"}">${iconSvg("heart")}<span>${selectedShopItem.favorites + (favorite ? 1 : 0)}</span></button>
          <button class="purchase-buy" type="button">立即购买</button>
        </div>
        <nav class="purchase-bottom-tools" aria-label="购买页导航">
          <button type="button" data-action="about">${iconSvg("about")}</button>
          <button type="button" data-action="custom">${iconSvg("chair-param")}</button>
          <button class="is-active" type="button">${iconSvg("bag")}</button>
          <button type="button" data-action="favorites">${iconSvg("heart")}</button>
          <button type="button" data-action="profile">${iconSvg("profile")}</button>
        </nav>
      </div>
    `;
  }

  function centerPurchaseViewer(): void {
    window.requestAnimationFrame(() => {
      const viewer = pageLayer.querySelector<HTMLElement>(".purchase-viewer");
      const main = pageLayer.querySelector<HTMLElement>("[data-purchase-main]");
      if (!viewer || !main) return;
      viewer.scrollLeft = main.offsetLeft - (viewer.clientWidth - main.clientWidth) / 2;
      syncPurchaseDots();
    });
  }

  function syncPurchaseDots(): void {
    const viewer = pageLayer.querySelector<HTMLElement>(".purchase-viewer");
    const cards = Array.from(pageLayer.querySelectorAll<HTMLElement>("[data-purchase-view]"));
    if (!viewer || cards.length === 0) return;
    const viewportCenter = viewer.scrollLeft + viewer.clientWidth / 2;
    let activeIndex = 0;
    let activeDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      if (distance < activeDistance) {
        activeDistance = distance;
        activeIndex = index;
      }
    });
    pageLayer.querySelectorAll<HTMLElement>("[data-purchase-dot]").forEach((dot) => {
      dot.classList.toggle("is-active", Number(dot.dataset.purchaseDot) === activeIndex);
    });
  }

  function bindPurchaseCarousel(): void {
    const viewer = pageLayer.querySelector<HTMLElement>(".purchase-viewer");
    if (!viewer) return;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let isDragging = false;

    viewer.addEventListener("scroll", syncPurchaseDots, { passive: true });
    viewer.addEventListener("pointerdown", (event) => {
      isDragging = true;
      dragStartX = event.clientX;
      dragStartScroll = viewer.scrollLeft;
      viewer.classList.add("is-dragging");
      viewer.setPointerCapture(event.pointerId);
    });
    viewer.addEventListener("pointermove", (event) => {
      if (!isDragging) return;
      viewer.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
      syncPurchaseDots();
    });
    viewer.addEventListener("pointerup", (event) => {
      if (!isDragging) return;
      isDragging = false;
      viewer.classList.remove("is-dragging");
      viewer.releasePointerCapture(event.pointerId);
      snapPurchaseViewer();
    });
    viewer.addEventListener("pointercancel", () => {
      isDragging = false;
      viewer.classList.remove("is-dragging");
      snapPurchaseViewer();
    });
    pageLayer.querySelectorAll<HTMLButtonElement>("[data-purchase-dot]").forEach((dot) => {
      dot.addEventListener("click", () => {
        const target = pageLayer.querySelector<HTMLElement>(`[data-purchase-view="${dot.dataset.purchaseDot}"]`);
        if (!target) return;
        viewer.scrollTo({
          left: target.offsetLeft - (viewer.clientWidth - target.clientWidth) / 2,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  function snapPurchaseViewer(): void {
    const viewer = pageLayer.querySelector<HTMLElement>(".purchase-viewer");
    const cards = Array.from(pageLayer.querySelectorAll<HTMLElement>("[data-purchase-view]"));
    if (!viewer || cards.length === 0) return;
    const viewportCenter = viewer.scrollLeft + viewer.clientWidth / 2;
    let targetCard = cards[0];
    let activeDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      if (distance < activeDistance) {
        activeDistance = distance;
        targetCard = card;
      }
    });
    viewer.scrollTo({
      left: targetCard.offsetLeft - (viewer.clientWidth - targetCard.clientWidth) / 2,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  function renderFavorites(): string {
    return `
      ${topbar("收藏")}
      <div class="prototype-scroll favorites-page">
        <section class="favorite-banner">
          <img src="/assets/endlessform/ef-11.jpg" alt="EndlessForm 展厅椅子阵列" />
          <div class="favorite-banner-copy">
            <span class="favorite-banner-icon">${iconSvg("heart")}</span>
            <small>FAVORITES</small>
            <h2>收藏夹</h2>
          </div>
        </section>
        <div class="favorite-card-grid">
          ${favoriteCards.map((card, index) => `
            <button class="favorite-card favorite-card-${index % 5}" type="button" data-action="shop" data-card-index="${index}">
              <img src="${card.image}" alt="${card.name}" />
              <span class="favorite-series">${card.series}</span>
              <span class="favorite-overlay">
                <strong>${card.name}</strong>
                <small>${card.price} · ♡ ${card.favorites} · 已卖出 ${card.sold}</small>
              </span>
            </button>
          `).join("")}
        </div>
      </div>
      ${pageBottomNav("favorites")}
    `;
  }

  function animatePageIn(targetView: ViewName): void {
    if (reducedMotion) return;
    const nodes = pageLayer.querySelectorAll<HTMLElement>(".prototype-topbar, .prototype-scroll, .graph-board, .page-bottom-nav");
    gsap.fromTo(nodes, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", stagger: 0.035 });

    if (targetView === "favorites") {
      gsap.fromTo(
        pageLayer.querySelectorAll<HTMLElement>(".favorite-card"),
        { opacity: 0, y: 18, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.36, ease: "power2.out", stagger: 0.035 },
      );
    }

    if (targetView === "about") {
      gsap.fromTo(
        pageLayer.querySelectorAll<HTMLElement>(".about-card, .about-rail"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", stagger: 0.045 },
      );
    }
  }

  function renderCustom(): string {
    return `
      ${topbar("参数化定制")}
      <div class="prototype-scroll">
        <section class="custom-hero">${iconSvg("chair-param")}<h2>科技感参数化椅子入口</h2><p>专业用户申请后，可进入 AI generation 与参数化定制流程。</p></section>
        <button class="wide-button" type="button">申请专业功能</button>
      </div>
    `;
  }

  function renderProfile(): string {
    return `
      ${topbar("我的")}
      <div class="prototype-scroll">
        <section class="lofi-section"><h2>收藏夹</h2><p>${favorite ? "已收藏当前推荐椅子。" : "尚未收藏当前推荐椅子。"}</p></section>
        <section class="lofi-section"><h2>订单</h2><p>购买记录与定制订单会显示在这里。</p></section>
        <section class="lofi-section"><h2>专业功能</h2><p>AI generation 功能申请状态：待申请。</p><button class="wide-button ghost" type="button" data-action="custom">申请入口</button></section>
      </div>
    `;
  }

  function bindPageActions(): void {
    pageLayer.querySelectorAll<HTMLElement>("[data-action]").forEach((node) => {
      node.addEventListener("click", () => {
        const action = node.dataset.action;
        if (node.dataset.cardIndex) {
          selectedShopItem = favoriteCards[Number(node.dataset.cardIndex)] || selectedShopItem;
        }
        if (node.dataset.aboutIndex) {
          activeAboutSection = aboutFeatureSections[Number(node.dataset.aboutIndex)] || activeAboutSection;
        }
        if (action === "home") openView("home");
        if (action === "sort") {
          sortModeIndex += 1;
          openView("graph");
        }
        if (action === "sort-menu") toggleSortSheet();
        if (action === "toggle-favorite") {
          favorite = !favorite;
          node.classList.toggle("is-active", favorite);
          node.setAttribute("aria-pressed", favorite ? "true" : "false");
          const countNode = node.querySelector("span");
          if (countNode) countNode.textContent = String(selectedShopItem.favorites + (favorite ? 1 : 0));
          return;
        }
        if (action === "about") openView("about");
        if (action === "about-detail") openView("about-detail");
        if (action === "graph") openView("graph");
        if (action === "ai") openAiComposer();
        if (action === "detail") openView("detail");
        if (action === "shop") openView("shop");
        if (action === "favorites") openView("favorites");
        if (action === "custom") openView("custom");
        if (action === "profile") openView("profile");
      });
    });
    pageLayer.querySelectorAll<HTMLElement>("[data-sort-index]").forEach((node) => {
      node.addEventListener("click", () => {
        sortModeIndex = Number(node.dataset.sortIndex || 0);
        openView("graph");
      });
    });
    pageLayer.querySelectorAll<HTMLElement>("[data-tab-index]").forEach((node) => {
      node.addEventListener("click", () => {
        activeDetailTab = Number(node.dataset.tabIndex || 0);
        openView("detail");
      });
    });
    if (view === "shop") bindPurchaseCarousel();
  }

  function toggleSortSheet(): void {
    const sheet = pageLayer.querySelector<HTMLElement>(".sort-sheet");
    if (!sheet) return;
    sheet.hidden = !sheet.hidden;
  }

  function stepFeed(direction: 1 | -1): void {
    if (transitionActive) return;
    if (view !== "home") return;
    const next = Math.max(0, feedIndex + direction);
    if (next === feedIndex && direction < 0) return;
    stopAutoRotate();

    if (reducedMotion) {
      feedIndex = next;
      recommendationCount = feedIndex + 1;
      renderFeed();
      startAutoRotate();
      return;
    }

    transitionActive = true;
    const nodes = cardMotionNodes();
    const exitY = direction > 0 ? -460 : 460;
    const enterY = direction > 0 ? 460 : -460;
    gsap.killTweensOf(nodes);

    gsap.timeline({
      onComplete: () => {
        transitionActive = false;
        startAutoRotate();
      },
    })
      .to(nodes, {
        y: exitY,
        opacity: 0,
        scale: 0.96,
        duration: 0.28,
        ease: "power2.in",
      })
      .call(() => {
        feedIndex = next;
        recommendationCount = feedIndex + 1;
        renderFeed();
        gsap.set(nodes, { y: enterY, opacity: 0, scale: 0.97 });
      })
      .to(nodes, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.44,
        ease: "power3.out",
      });

    gsap.fromTo(".feed-card-indicator", { y: direction > 0 ? 22 : -22, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.34, ease: "power2.out" });
  }

  function sendPrompt(): void {
    if (!composerInput) return;
    feedIndex = 5 + Math.floor(Math.random() * 2);
    renderFeed();
    overlay.setPrototypeCopy("我为您推荐了一把椅子，点击查看详情");
  }

  favoriteButton.addEventListener("click", () => {
    favorite = !favorite;
    favoriteButton.textContent = favorite ? "♥" : "♡";
    favoriteButton.classList.toggle("is-active", favorite);
  });
  detailButton.addEventListener("click", () => {
    selectActiveChair();
    openView("detail");
  });
  topCustomButton.addEventListener("click", () => openView("custom"));
  sendButton?.addEventListener("click", sendPrompt);
  composerInput?.addEventListener("input", () => {
    const value = composerInput.value.trim();
    setComposerTags(value ? intentTags.filter((tag) => value.includes(tag[0]) || tag.length > 2) : guideTags);
  });
  composerInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") sendPrompt();
  });

  bottomNav.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const nav = button.dataset.nav as ViewName;
      if (nav === "ai") {
        openAiComposer();
        return;
      }
      if (nav === "graph") {
        graphHintDismissed = true;
        root.dataset.graphHint = "hidden";
      }
      openView(nav);
    });
  });

  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const actionNode = target?.closest<HTMLElement>("[data-action]");
    if (!actionNode || pageLayer.contains(actionNode)) return;
    const action = actionNode.dataset.action as ViewName | "detail" | undefined;
    if (!action) return;
    if (action === "ai") {
      openAiComposer();
      return;
    }
    if (action === "graph") {
      graphHintDismissed = true;
      root.dataset.graphHint = "hidden";
    }
    if (action === "detail") {
      selectActiveChair();
      openView("detail");
    } else if (action === "shop") {
      selectActiveChair();
      openView("shop");
    } else openView(action);
  });

  function onWheel(event: WheelEvent): void {
    if (view !== "home") return;
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || Math.abs(event.deltaY) < 18) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheelAt < 520) return;
    lastWheelAt = now;
    stepFeed(event.deltaY > 0 ? 1 : -1);
  }

  function onPointerDown(event: PointerEvent): void {
    stopAutoRotate();
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target };
  }

  function onPointerUp(event: PointerEvent): void {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    const target = pointerStart.target as HTMLElement | null;
    pointerStart = null;

    if (target?.closest("[data-ui-interactive]")) return;
    if (Math.abs(dy) > 72 && Math.abs(dy) > Math.abs(dx) * 1.4) {
      stepFeed(dy < 0 ? 1 : -1);
      return;
    }
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && event.clientY > window.innerHeight * 0.22 && event.clientY < window.innerHeight * 0.78) {
      selectActiveChair();
      openView("shop");
    }
    window.setTimeout(startAutoRotate, 1200);
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerUp);

  renderFeed();

  return {
    dispose() {
      window.removeEventListener("wheel", onWheel);
      stopAutoRotate();
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerUp);
      root.classList.remove("prototype-ui");
      delete root.dataset.prototypeCopyLock;
      chairCard.remove();
      topCustomButton.remove();
      actionRail.remove();
      feedMeta.remove();
      composer.remove();
      graphPrompt.remove();
      cardIndicator.remove();
      bottomNav.remove();
      pageLayer.remove();
    },
  };
}
