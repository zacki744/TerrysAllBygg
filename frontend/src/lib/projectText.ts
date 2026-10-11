// src/lib/projectText.ts
// Stöd för att skriva projekttexter i admin. En text som nämner ort,
// material och vad som byggdes hjälper både kunder och Google
// ("altan i Simrishamn"), så formuläret visar vad som saknas.

export const WORDS_MIN = 80;
export const WORDS_MAX = 200;

/** Orter på och kring Österlen. Används bara för tipset "nämn orten". */
const PLACES = [
  "Österlen", "Simrishamn", "Tomelilla", "Ystad", "Kivik", "Brösarp", "Skillinge",
  "Kåseberga", "Löderup", "Borrby", "Hammenhög", "Gärsnäs", "Sankt Olof", "S:t Olof",
  "Vitaby", "Baskemölla", "Vik", "Sjöbo", "Kristianstad", "Degeberga", "Rörum",
  "Glemmingebro", "Smedstorp", "Gladsax", "Ravlunda", "Stenshuvud", "Skåne",
];
const PLACE_RE = new RegExp(`(^|[^\\p{L}])(${PLACES.map((p) => p.replace(".", "\\.")).join("|")})(?![\\p{L}])`, "iu");

export const TEMPLATE =
  "[Vad byggde vi – t.ex. en altan med pergola] i [ort]. [Vad ville kunden ha, och hur skulle det användas?]\n\n" +
  "Vi byggde i [material] och valde det för att [varför]. Arbetet tog [hur lång tid].\n\n" +
  "[Vad var speciellt med projektet – en utmaning, ett önskemål eller en detalj du är extra nöjd med?]";

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** Kvar från mallen: text inom [hakparenteser]. */
export const hasPlaceholders = (text: string) => /\[[^\]\n]{2,}\]/.test(text);

export const mentionsPlace = (text: string) => PLACE_RE.test(text);
