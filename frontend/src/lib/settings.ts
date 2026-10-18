// src/lib/settings.ts
// ══════════════════════════════════════════════════════════
// Webbplatsinställningar som Terry ändrar i admin → Inställningar.
//
// API:t (/api/settings) sparar bara det som ändrats; tomma fält (null)
// betyder "använd standardvärdet" nedan. Standardtexterna finns alltså
// bara här. Telefon, e-post och org.nr ligger kvar i contact.ts eftersom
// de även används i mejlen från servern.
// ══════════════════════════════════════════════════════════

import { DEFAULT_CATEGORIES, type Category } from "./categories";

export type HeroFocus = "left" | "center" | "right";

export interface SiteSettings {
  heroTitle:        string;
  heroLead:         string;
  heroImage:        string | null;   // null = standardbilden i src/assets
  heroImageWidth:   number | null;
  heroImageHeight:  number | null;
  heroImageAlt:     string;
  heroImageFocus:   HeroFocus;
  trustRot:         boolean;
  trustFTax:        boolean;
  trustInsured:     boolean;
  showReviews:      boolean;
  googleReviewsUrl: string;
  address:          string;
  facebook:         string;
  instagram:        string;
  aboutStory:       string;
  categories:       Category[];  // admin → Inställningar → Kategorier
}

/** Som API:t skickar dem: null eller saknat fält = standardvärde. */
export type ApiSettings = { [K in keyof SiteSettings]?: SiteSettings[K] | null };

export const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "Byggprojekt med omsorg och hantverk",
  heroLead:
    "Terrys Allbygg är ditt lokala bygg- och snickeriföretag på Österlen, Skåne. " +
    "Vi designar och uppför byggprojekt tillsammans med kunden såsom bastuer, " +
    "tillbyggnader, förråd och andra specialanpassade lösningar.",
  heroImage:       null,
  heroImageWidth:  null,
  heroImageHeight: null,
  heroImageAlt:    "Terrys Allbygg — byggprojekt i Österlen",
  heroImageFocus:  "center",
  trustRot:        false,
  trustFTax:       false,
  trustInsured:    false,
  showReviews:     false,
  googleReviewsUrl: "",
  address:         "",
  facebook:        "",
  instagram:       "",
  aboutStory:
    "Terrys Allbygg grundades av Terry med målet att erbjuda Österlens invånare en pålitlig " +
    "hantverkare som håller vad han lovar. Med erfarenhet inom byggbranschen och en passion " +
    "för hantverk har vi hjälpt många kunder förverkliga sina drömmar — från enkla förråd till " +
    "avancerade tillbyggnader och skräddarsydda snickerier.\n\n" +
    "Vi är stolta över att vara ett lokalt företag som känner sin bygd och sina kunder. " +
    "För oss är varje projekt unikt och varje kund förtjänar full uppmärksamhet från start till mål.",
  categories: DEFAULT_CATEGORIES,
};

/** En kategori från API:t, eller null om den är trasig. */
function toCategory(raw: unknown): Category | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.slug !== "string" || typeof r.name !== "string" || !r.slug || !r.name) return null;
  return { slug: r.slug, name: r.name, detail: typeof r.detail === "string" ? r.detail : "" };
}

const KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[];

/** API-svar → kompletta inställningar (standardvärde där inget är sparat). */
export function mergeSettings(api: ApiSettings | null | undefined): SiteSettings {
  const out = { ...DEFAULT_SETTINGS } as Record<keyof SiteSettings, unknown>;
  for (const key of KEYS) {
    const value = api?.[key];
    if (value === null || value === undefined) continue;
    if (key === "categories") {
      if (!Array.isArray(value)) continue;
      out.categories = value.map(toCategory).filter((c): c is Category => c !== null);
      continue;
    }
    if (typeof value === "string" && value.trim() === "") continue;
    if (typeof value !== typeof DEFAULT_SETTINGS[key] && DEFAULT_SETTINGS[key] !== null) continue;
    out[key] = value;
  }
  return out as SiteSettings;
}

/** Formulär → API. Texter som är oförändrade standardtexter skickas som null,
 *  så att en framtida ändring av standardtexten slår igenom. */
export function toApiSettings(s: SiteSettings): ApiSettings {
  const out: Record<string, unknown> = {};
  for (const key of KEYS) {
    const value = s[key];
    if (key === "categories") {
      // Oförändrad standardlista skickas som null, så att ändringar i koden slår igenom
      out.categories = JSON.stringify(value) === JSON.stringify(DEFAULT_SETTINGS.categories) ? null : value;
      continue;
    }
    out[key] = typeof value === "string" && (value.trim() === "" || value === DEFAULT_SETTINGS[key])
      ? null
      : value;
  }
  return out as ApiSettings;
}

// ── Förrenderade inställningar ─────────────────────────────
// scripts/prerender.mjs bäddar in inställningarna i HTML:en, så att sidan
// visar rätt innehåll direkt. Sedan hämtas färska värden från API:t.

// Samma id används i scripts/prerender.mjs
const SETTINGS_SCRIPT_ID = "site-settings";

export function readEmbeddedSettings(): SiteSettings {
  try {
    const el = document.getElementById(SETTINGS_SCRIPT_ID);
    return mergeSettings(el?.textContent ? (JSON.parse(el.textContent) as ApiSettings) : null);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ── Hjälpare för sidorna ───────────────────────────────────

/** Hero-bilden finns även i 960 px bredd (se AdminSettingsController). */
export const heroSmallUrl = (path: string) => path.replace(/\.webp$/, "-960.webp");

/** Tom rad i texten = nytt stycke. */
export const paragraphs = (text: string) =>
  text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const trustItems = (s: SiteSettings): string[] =>
  [
    s.trustRot && "ROT-avdrag direkt på fakturan",
    "Kostnadsfri konsultation",
    "Lokalt företag på Österlen",
    s.trustFTax && "Godkänd för F-skatt",
    s.trustInsured && "Ansvarsförsäkrad",
  ].filter((t): t is string => Boolean(t));

export const reviewsUrl = (s: SiteSettings) =>
  s.showReviews && s.googleReviewsUrl ? s.googleReviewsUrl : null;
