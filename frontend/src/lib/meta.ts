// src/lib/meta.ts

// Google kortar utdrag vid ~160 tecken — korta i stället vid ordgräns
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:–—-]$/, "") + "…";
}

