export function createRobotIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 22 22");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("robot-icon");
  svg.innerHTML = `
    <path d="M8 4.8V3.2M11 3.2h-3" />
    <rect x="5.2" y="5.4" width="11.6" height="10.2" rx="3" />
    <path d="M3.8 9.4v2.8M18.2 9.4v2.8" />
    <circle cx="9" cy="10.5" r="0.8" />
    <circle cx="13" cy="10.5" r="0.8" />
  `;
  return svg;
}
