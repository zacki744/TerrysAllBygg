// src/lib/formLimits.ts
// Maxlängder för formulärfälten. Samma värden kontrolleras på servern i
// TABB/Model/FormLimits.cs — ändra på båda ställena.
export const FORM_LIMITS = {
  name:      100,
  email:     254,
  phone:     30,
  shortText: 200,
  longText:  3000,
} as const;
