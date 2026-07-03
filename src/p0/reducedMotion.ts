export function prefersReducedMotion(): boolean {
  const query = new URLSearchParams(window.location.search).get("reducedMotion");
  if (query === "1" || query === "true") return true;
  if (query === "0" || query === "false") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
