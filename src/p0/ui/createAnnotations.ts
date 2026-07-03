export function createAnnotations(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("annotation-overlay");
  svg.setAttribute("viewBox", "0 0 393 852");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = `
    <path class="annotation-line" d="M76 292 C104 296 122 307 145 318" />
    <path class="annotation-line" d="M72 505 C98 503 116 500 132 500" />
    <path class="annotation-line" d="M317 325 C292 327 276 334 258 340" />
    <path class="annotation-line" d="M316 535 C294 534 276 529 260 525" />

    <g class="annotation-node" transform="translate(58 292)">
      <circle r="24" />
      <text y="-3"><tspan x="0">形态</tspan><tspan x="0" dy="17">生成</tspan></text>
    </g>
    <g class="annotation-node" transform="translate(54 505)">
      <circle r="24" />
      <text y="-3"><tspan x="0">结构</tspan><tspan x="0" dy="17">变化</tspan></text>
    </g>
    <g class="annotation-node" transform="translate(335 325)">
      <circle r="24" />
      <text y="-3"><tspan x="0">颜色</tspan><tspan x="0" dy="17">映射</tspan></text>
    </g>
    <g class="annotation-node" transform="translate(334 535)">
      <circle r="24" />
      <text y="-3"><tspan x="0">参数</tspan><tspan x="0" dy="17">演化</tspan></text>
    </g>
  `;
  return svg;
}
