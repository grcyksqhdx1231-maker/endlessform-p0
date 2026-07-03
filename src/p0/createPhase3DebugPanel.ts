import { CHAIR_STATES } from "./interaction/chairStates";
import type { ChairRotationController } from "./interaction/createChairRotationController";
import type { InteractiveMaterials } from "./materials/createInteractiveMaterials";
import type { P0Overlay } from "./ui/createP0Overlay";
import type { P0StateController } from "./createP0StateController";

interface Phase3DebugOptions {
  state: P0StateController;
  rotation: ChairRotationController;
  materials: InteractiveMaterials;
  overlay: P0Overlay;
  onReplay: () => void;
  onChange: () => void;
}

export function createPhase3DebugPanel(options: Phase3DebugOptions): () => void {
  const panel = document.createElement("aside");
  panel.className = "debug-panel phase3-debug-panel";
  panel.innerHTML = `
    <h2>Phase 3 Interaction</h2>
    <button type="button" data-control="replay">Replay assembly</button>
    <button type="button" data-control="clearHint">Clear hint session</button>
    <label>Material mode <select data-control="materialMode"><option value="interactive">Interactive pastel</option><option value="original">Original textured</option></select></label>
    <div class="debug-button-grid">
      ${CHAIR_STATES.map((state, index) => `<button type="button" data-state="${index}">${state.id}</button>`).join("")}
    </div>
    <pre data-value="status"></pre>
  `;
  document.body.append(panel);

  const materialMode = panel.querySelector<HTMLSelectElement>('[data-control="materialMode"]')!;
  const status = panel.querySelector<HTMLElement>('[data-value="status"]')!;

  function refresh(): void {
    const snapshot = options.state.snapshot();
    materialMode.value = options.materials.mode;
    status.textContent = JSON.stringify(
      {
        currentUnwrappedAngle: snapshot.currentUnwrappedAngle,
        normalizedAngle: snapshot.normalizedAngleDegrees,
        activeState: CHAIR_STATES[snapshot.activeStateIndex].id,
        activeCopyState: CHAIR_STATES[snapshot.activeCopyStateIndex].id,
        interactionEnabled: snapshot.interactionEnabled,
        isDragging: snapshot.isDragging,
        currentHexColor: snapshot.currentHexColor,
        materialMode: options.materials.mode,
      },
      null,
      2,
    );
  }

  panel.querySelector<HTMLButtonElement>('[data-control="replay"]')!.addEventListener("click", () => {
    options.onReplay();
    refresh();
  });
  panel.querySelector<HTMLButtonElement>('[data-control="clearHint"]')!.addEventListener("click", () => {
    options.overlay.hint.clearSeen();
    refresh();
  });
  materialMode.addEventListener("change", () => {
    options.materials.setMode(materialMode.value === "original" ? "original" : "interactive");
    options.onChange();
    refresh();
  });
  panel.querySelectorAll<HTMLButtonElement>("[data-state]").forEach((button) => {
    button.addEventListener("click", () => {
      options.rotation.snapToState(Number(button.dataset.state), false);
      options.onChange();
      refresh();
    });
  });

  const interval = window.setInterval(refresh, 150);
  refresh();

  return () => {
    window.clearInterval(interval);
    panel.remove();
  };
}
