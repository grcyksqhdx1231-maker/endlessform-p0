function laurelSvg(side: "left" | "right"): string {
  const transform = side === "right" ? "scale(-1 1) translate(-42 0)" : "";
  return `
    <svg class="award-laurel" viewBox="0 0 42 62" aria-hidden="true">
      <g transform="${transform}">
        <path class="award-laurel-stem" d="M33 5 C19 17 12 34 13 56" />
        <path class="award-laurel-leaf" d="M27.8 13.2 C22.8 12.6 18.2 15.2 15.7 20.6 C21 20.2 25.1 17.7 27.8 13.2Z" />
        <path class="award-laurel-leaf" d="M24.4 22.8 C19.5 23.1 15.9 26.2 13.9 31.9 C18.9 30.9 22.5 27.8 24.4 22.8Z" />
        <path class="award-laurel-leaf" d="M22.5 33.5 C17.9 34.5 14.8 38 13.7 43.4 C18.2 41.8 21.2 38.5 22.5 33.5Z" />
        <path class="award-laurel-leaf" d="M22.6 44.3 C18.8 46 16.4 49.3 15.4 54.3 C19.4 52.3 21.9 49.1 22.6 44.3Z" />
        <path class="award-laurel-leaf inner" d="M31 20.8 C26.9 20.8 23.7 23 21.7 27.2 C25.8 26.8 28.9 24.6 31 20.8Z" />
        <path class="award-laurel-leaf inner" d="M27.6 31 C23.7 31.8 21 34.4 19.9 38.8 C23.7 37.7 26.2 35 27.6 31Z" />
        <path class="award-laurel-leaf inner" d="M26 41.6 C22.7 43 20.8 45.8 20.1 50 C23.2 48.3 25.2 45.5 26 41.6Z" />
      </g>
    </svg>
  `;
}

export function createAwardFooter(): HTMLElement {
  const footer = document.createElement("footer");
  footer.className = "fortune-award";
  footer.innerHTML = `
    ${laurelSvg("left")}
    <div class="award-copy" aria-label="FORTUNE CHINA BEST DESIGNS 2022 入选《财富》中国最佳设计榜">
      <div class="award-line award-line-small">FORTUNE CHINA</div>
      <div class="award-line award-line-main">BEST DESIGNS 2022</div>
      <div class="award-line award-line-cn">入选《财富》中国最佳设计榜</div>
    </div>
    ${laurelSvg("right")}
  `;
  return footer;
}
