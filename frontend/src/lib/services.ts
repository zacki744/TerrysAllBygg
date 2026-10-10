// src/lib/services.ts
// ══════════════════════════════════════════════════════════
// Enda listan över tjänster. Används på startsidan, Om oss och i
// strukturerad data (schema.org) så att Google vet vad företaget gör.
// ══════════════════════════════════════════════════════════

export const SERVICES = [
  { name: "Bastuer",                 detail: "utomhus och inomhus" },
  { name: "Tillbyggnader",           detail: "och ombyggnationer" },
  { name: "Altaner",                 detail: "och uteplatser" },
  { name: "Förråd och garage",       detail: "" },
  { name: "Trädgårdsstudios",        detail: "och gästhus" },
  { name: "Snickerier",              detail: "skräddarsydda, framför allt utomhusmöbler" },
  { name: "Renoveringar",            detail: "" },
] as const;
