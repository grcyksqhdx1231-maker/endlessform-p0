import { gsap } from "gsap";
import { createAnnotations } from "./createAnnotations";
import { createAwardFooter } from "./createAwardFooter";
import { animateDialogueCopy } from "./animateDialogueCopy";
import { createRobotIcon } from "./createRobotIcon";
import { createRotationHint, type RotationHint } from "./createRotationHint";

export interface P0Overlay {
  root: HTMLElement;
  dialogueCopy: HTMLElement;
  hint: RotationHint;
  setCopy: (copy: string) => void;
  setPrototypeCopy: (copy: string) => void;
  showChrome: () => void;
  dispose: () => void;
}

export function createP0Overlay(initialCopy: string, reducedMotion: boolean): P0Overlay {
  const root = document.querySelector<HTMLElement>(".p0-page");
  if (!root) throw new Error("Missing .p0-page root.");

  const annotations = createAnnotations();
  const dialogue = document.createElement("section");
  dialogue.className = "ai-dialogue";
  dialogue.setAttribute("aria-live", "polite");
  dialogue.appendChild(createRobotIcon());

  const divider = document.createElement("div");
  divider.className = "dialogue-divider";
  dialogue.appendChild(divider);

  const copy = document.createElement("div");
  copy.className = "dialogue-copy";
  copy.textContent = initialCopy;
  dialogue.appendChild(copy);

  const hint = createRotationHint(reducedMotion);
  const award = createAwardFooter();

  root.append(annotations, dialogue, hint.element, award);
  gsap.set([annotations, dialogue, award], { opacity: 0 });

  return {
    root,
    dialogueCopy: copy,
    hint,
    setCopy(nextCopy) {
      if (root.dataset.prototypeCopyLock === "true") return;
      animateDialogueCopy(copy, nextCopy, reducedMotion);
    },
    setPrototypeCopy(nextCopy) {
      animateDialogueCopy(copy, nextCopy, reducedMotion);
    },
    showChrome() {
      gsap.to([dialogue, annotations, award], {
        opacity: 1,
        duration: reducedMotion ? 0.12 : 0.55,
        stagger: reducedMotion ? 0 : 0.06,
        ease: "power2.out",
      });
    },
    dispose() {
      annotations.remove();
      dialogue.remove();
      hint.element.remove();
      award.remove();
    },
  };
}
