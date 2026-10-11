// src/lib/projectText.ts
// Stöd för att skriva projekttexter i admin. En text som nämner ort,
// material och vad som byggdes hjälper både kunder och Google
// ("altan i Simrishamn"), så formuläret visar vad som saknas.

// Projekten på sajten är ofta gallerier per typ av arbete ("Grindar", "Golv"),
// så målet är några meningar, inte en hel artikel.
export const WORDS_MIN = 40;
export const WORDS_MAX = 150;

/** Orter på och kring Österlen. Används bara för tipset "nämn orten". */
const PLACES = [
  "Österlen", "Simrishamn", "Tomelilla", "Ystad", "Kivik", "Brösarp", "Skillinge",
  "Kåseberga", "Löderup", "Borrby", "Hammenhög", "Gärsnäs", "Sankt Olof", "S:t Olof",
  "Vitaby", "Baskemölla", "Vik", "Sjöbo", "Kristianstad", "Degeberga", "Rörum",
  "Glemmingebro", "Smedstorp", "Gladsax", "Ravlunda", "Stenshuvud", "Skåne",
];
const PLACE_RE = new RegExp(`(^|[^\\p{L}])(${PLACES.map((p) => p.replace(".", "\\.")).join("|")})(?![\\p{L}])`, "iu");

export const TEMPLATE =
  "[Vad visar bilderna – t.ex. grindar och staket vi har byggt] i [orter, t.ex. Simrishamn och Kivik]. " +
  "[Vad brukar kunderna vilja ha, och hur används det?]\n\n" +
  "Vi arbetar oftast i [material] eftersom [varför]. [Något du är extra nöjd med, eller ett exempel på ett uppdrag.]";

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Kvar från mallen: text inom [hakparenteser]. */
export const hasPlaceholders = (text: string) => /\[[^\]\n]{2,}\]/.test(text);

export const mentionsPlace = (text: string) => PLACE_RE.test(text);
