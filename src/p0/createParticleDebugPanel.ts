import type { LoadingTimelineHandle } from "./createLoadingTimeline";
import type { ParticleAssembly } from "./particles/createParticleAssembly";
import type { ParticleQuality } from "./particles/particleQuality";

interface ParticleDebugOptions {
  particleAssembly: ParticleAssembly;
  loadingTimeline: LoadingTimelineHandle;
  onChange: () => void;
}

function setQueryQuality(quality: ParticleQuality): void {
  const url = new URL(window.location.href);
  url.searchParams.set("debug", "1");
  url.searchParams.set("quality", quality);
  window.location.href = url.toString();
}

export function createParticleDebugPanel(options: ParticleDebugOptions): () => void {
  const panel = document.createElement("aside");
  panel.className = "debug-panel particle-debug-panel";
  panel.innerHTML = `
    <h2>Particle Assembly</h2>
    <button type="button" data-control="replay">Replay assembly</button>
    <button type="button" data-control="pause">Pause</button>
    <button type="button" data-control="resume">Resume</button>
    <label>timeline <output data-value="time"></output><input data-control="time" type="range" min="0" max="2.2" step="0.01"></label>
    <label>Particle quality <select data-control="quality"><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select></label>
    <label>Particle count <output data-value="count"></output></label>
    <label>uPointSize <output data-value="pointSize"></output><input data-control="pointSize" type="range" min="1.2" max="2.4" step="0.05"></label>
    <pre data-value="status"></pre>
  `;
  document.body.append(panel);

  const replay = panel.querySelector<HTMLButtonElement>('[data-control="replay"]')!;
  const pause = panel.querySelector<HTMLButtonElement>('[data-control="pause"]')!;
  const resume = panel.querySelector<HTMLButtonElement>('[data-control="resume"]')!;
  const time = panel.querySelector<HTMLInputElement>('[data-control="time"]')!;
  const quality = panel.querySelector<HTMLSelectElement>('[data-control="quality"]')!;
  const pointSize = panel.querySelector<HTMLInputElement>('[data-control="pointSize"]')!;
  const status = panel.querySelector<HTMLElement>('[data-value="status"]')!;

  quality.value = options.particleAssembly.quality;
  pointSize.value = String(options.particleAssembly.snapshot().pointSize);

  function refresh(): void {
    const snapshot = options.particleAssembly.snapshot();
    time.value = options.loadingTimeline.timeline.time().toFixed(2);
    panel.querySelector<HTMLElement>('[data-value="time"]')!.textContent = `${time.value}s`;
    panel.querySelector<HTMLElement>('[data-value="count"]')!.textContent = String(snapshot.count);
    panel.querySelector<HTMLElement>('[data-value="pointSize"]')!.textContent = snapshot.pointSize.toFixed(2);
    status.textContent = JSON.stringify(
      {
        uProgress: snapshot.progress,
        uOpacity: snapshot.opacity,
        particlesVisible: snapshot.visible,
        particlesActive: snapshot.active,
        assemblyComplete: snapshot.assemblyComplete,
      },
      null,
      2,
    );
  }

  replay.addEventListener("click", () => {
    options.loadingTimeline.replay();
    refresh();
  });
  pause.addEventListener("click", () => {
    options.loadingTimeline.timeline.pause();
    refresh();
  });
  resume.addEventListener("click", () => {
    options.loadingTimeline.timeline.play();
    refresh();
  });
  time.addEventListener("input", () => {
    options.loadingTimeline.seek(Number(time.value));
    options.onChange();
    refresh();
  });
  pointSize.addEventListener("input", () => {
    options.particleAssembly.setPointSize(Number(pointSize.value));
    options.onChange();
    refresh();
  });
  quality.addEventListener("change", () => setQueryQuality(quality.value as ParticleQuality));

  const interval = window.setInterval(refresh, 150);
  refresh();

  return () => {
    window.clearInterval(interval);
    panel.remove();
  };
}
