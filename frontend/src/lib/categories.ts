// src/lib/categories.ts
// ══════════════════════════════════════════════════════════
// Kategorier av arbeten. Terry ändrar listan i admin → Inställningar →
// Kategorier; den här listan gäller tills något sparats där.
//
// Kategorin är en etikett på projekt och används till:
//   • filtret på projektsidan (/projekt?kategori=altaner)
//   • "Typ av projekt" i bokningsformuläret
//   • listan "Det här bygger vi" på startsidan och Om oss
//   • tjänsterna i företagets strukturerade data (schema.org)
// ══════════════════════════════════════════════════════════

export interface Category {
  slug: string;     // används i filterlänkar; ändras inte efter att kategorin sparats
  name: string;     // "Altaner"
  detail: string;   // "och uteplatser" — står efter namnet i listor
}

export const DEFAULT_CATEGORIES: Category[] = [
  { slug: "bastu", name: "Bastuer", detail: "utomhus och inomhus" },
  { slug: "tillbyggnad", name: "Tillbyggnader", detail: "och ombyggnationer" },
  { slug: "altaner", name: "Altaner", detail: "och uteplatser" },
  { slug: "forrad-och-garage", name: "Förråd och garage", detail: "" },
  { slug: "tradgardsstudio", name: "Trädgårdsstudios", detail: "och gästhus" },
  { slug: "snickerier", name: "Snickerier", detail: "skräddarsydda, framför allt utomhusmöbler" },
  { slug: "renovering", name: "Renoveringar", detail: "" },
];

export const findCategory = (categories: readonly Category[], slug: string | null | undefined) =>
  slug ? categories.find((c) => c.slug === slug) : undefined;

/** Projektsidan, filtrerad på en kategori. */
export const categoryPath = (slug: string) => `/projekt?kategori=${slug}`;

/** Kontroll innan kategorierna sparas i admin (servern kontrollerar samma sak). */
export function validateCategories(categories: readonly { name: string; slug: string }[]): string | null {
  const seen = new Set<string>();
  for (const c of categories) {
    if (!c.name.trim()) return "Alla kategorier behöver ett namn.";
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) return `"${c.name}": adressen får bara innehålla a–z, 0–9 och bindestreck.`;
    if (seen.has(c.slug)) return `Två kategorier har samma adress (${c.slug}).`;
    seen.add(c.slug);
  }
  return null;
}

// ── Förslag i admin ────────────────────────────────────────
// När ett projekt saknar kategori föreslår formuläret en utifrån titeln.
// Bara ett förslag — sajten använder bara kategorier som är satta.
const SUGGEST_KEYWORDS: Record<string, RegExp> = {
  "bastu": /bastu/i,
  "tillbyggnad": /tillbyggnad|ombyggnad|uterum|inglasa/i,
  "altaner": /altan|trall|trädäck|uteplats|pergola|däck/i,
  "forrad-och-garage": /förråd|garage|carport|friggebod|vedbod|bod\b/i,
  "tradgardsstudio": /studio|gästhus|attefall|ateljé|lusthus/i,
  "snickerier": /snickeri|möbel|möbler|bänk|bord|hammock|grind|staket|utedusch|plantering/i,
  "renovering": /renover|repar|reper|fasad|fönster|dörr|golv|\btak\b|takläggning|takbyte|målning|måla|målat/i,
};

const stem = (text: string) => text.toLowerCase().slice(0, Math.max(4, text.length - 2));

export function suggestCategory(categories: readonly Category[], title: string, description = ""): Category | undefined {
  const matches = (c: Category, text: string) =>
    SUGGEST_KEYWORDS[c.slug]?.test(text) || (c.name.trim().length >= 3 && text.toLowerCase().includes(stem(c.name.trim())));
  return categories.find((c) => matches(c, title)) ?? categories.find((c) => matches(c, description));
}
