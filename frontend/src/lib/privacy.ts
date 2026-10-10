// src/lib/privacy.ts
// ══════════════════════════════════════════════════════════
// Enda stället där integritetsrelaterade värden definieras.
// Ändras något här ska "lastUpdated" uppdateras.
// ══════════════════════════════════════════════════════════

export const PRIVACY = {
  path:        "/integritetspolicy",
  lastUpdated: "2026-10-10",

  // Hur länge förfrågningar sparas om de inte leder till ett uppdrag
  inquiryRetentionMonths: 12,

  // Matchar Serilog retainedFileCountLimit i TABB/API/Program.cs
  logRetentionDays: 14,
} as const;
