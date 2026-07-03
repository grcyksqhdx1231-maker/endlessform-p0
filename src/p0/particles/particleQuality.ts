export type ParticleQuality = "low" | "medium" | "high";

export const PARTICLE_COUNTS: Record<ParticleQuality, number> = {
  low: 8000,
  medium: 14000,
  high: 20000,
};

function queryQuality(): ParticleQuality | null {
  const value = new URLSearchParams(window.location.search).get("quality");
  if (value === "low" || value === "medium" || value === "high") return value;
  return null;
}

export function selectParticleQuality(reducedMotion: boolean): ParticleQuality {
  const manual = queryQuality();
  if (manual) return manual;
  if (reducedMotion) return "low";

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = navigator.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 4;
  const viewportArea = window.innerWidth * window.innerHeight;

  if (cores <= 4 || memory <= 3 || viewportArea < 340000) return "low";
  if (cores >= 10 && memory >= 8 && viewportArea > 900000) return "high";
  return "medium";
}

export function particleCountForQuality(quality: ParticleQuality): number {
  return PARTICLE_COUNTS[quality];
}
