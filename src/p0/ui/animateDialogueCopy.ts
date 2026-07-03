import { gsap } from "gsap";

export function animateDialogueCopy(element: HTMLElement, copy: string, reducedMotion: boolean): void {
  if (element.textContent === copy) return;

  gsap.killTweensOf(element);
  if (reducedMotion) {
    element.textContent = copy;
    gsap.fromTo(element, { opacity: 0.7 }, { opacity: 1, duration: 0.12 });
    return;
  }

  gsap.timeline()
    .to(element, {
      opacity: 0,
      y: -4,
      duration: 0.15,
      ease: "power2.out",
      onComplete: () => {
        element.textContent = copy;
        gsap.set(element, { y: 4 });
      },
    })
    .to(element, {
      opacity: 1,
      y: 0,
      duration: 0.17,
      ease: "power2.out",
    });
}
