// scripts/prerender.mjs
// Körs efter `vite build` + SSR-build (se "build" i package.json).
//
// För varje fast sida skrivs dist/<sida>/index.html med färdig HTML och
// sidans egna meta-taggar. Den orörda SPA-mallen sparas som
// dist/index.spa.html och används av backend för dynamiska sidor
// (projekt, snickerier) och för 404.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root    = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const ssrDir  = path.join(root, "dist-ssr");

// Fasta sidor. Sitemapen (SitemapController) läser vilka sidor som
// förrenderats, så nya sidor här hamnar där automatiskt.
const STATIC_ROUTES = ["/", "/projekt", "/snickerier", "/about", "/book", "/integritetspolicy"];

// ── Webbplatsinställningar ────────────────────────────────
// Hämtas från den publicerade sajten så att förrenderad HTML visar det Terry
// har sparat i admin (hero, förtroenderad, adress …). Saknas API:t (första
// deployen, eller offline) används standardvärdena i src/lib/settings.ts.
// Ändringar efter deploy hämtas ändå av webbläsaren när sidan laddas.
const SETTINGS_URL = process.env.SETTINGS_URL ?? "https://terrysallbygg.se/api/settings";

async function fetchSettings() {
  if (SETTINGS_URL === "off") return null;
  try {
    const res = await fetch(SETTINGS_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`inställningar: hämtade från ${SETTINGS_URL}`);
    return data;
  } catch (err) {
    console.warn(`inställningar: kunde inte hämta ${SETTINGS_URL} (${err.message}) — standardvärden används`);
    return null;
  }
}

const settings = await fetchSettings();

// JSON i <script type="application/json"> körs inte (CSP påverkas inte).
// "<" escapas så att en text i inställningarna aldrig kan avsluta taggen.
const settingsTag = settings
  ? `<script id="site-settings" type="application/json">${JSON.stringify(settings).replace(/</g, "\\u003c")}</script>`
  : "";

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8")
  .replace("</body>", `${settingsTag}</body>`);
fs.writeFileSync(path.join(distDir, "index.spa.html"), template);

const { render, serviceRoutes } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const ROUTES = [...STATIC_ROUTES, ...serviceRoutes(settings)];


// Taggar i index.html som sidan själv sätter via <PageMeta> tas bort ur mallen
const OWNED_BY_PAGE = [
  /\s*<!-- Open Graph -->/,
  /\s*<title>[\s\S]*?<\/title>/,
  /\s*<meta name="description"[^>]*>/,
  /\s*<meta property="og:[^"]*"[^>]*>/g,
  /\s*<meta name="twitter:[^"]*"[^>]*>/g,
];

// Head-taggar som React renderar inline: title, meta och canonical
const HEAD_TAG = /<title>[\s\S]*?<\/title>|<meta [^>]*\/>|<link rel="canonical"[^>]*\/>/g;

for (const route of ROUTES) {
  let html = render(route, settings);

  // Flytta head-taggarna till <head>. data-prerender gör att main.tsx kan ta
  // bort dem innan React lägger in sina egna, så att inget dubbleras.
  const headTags = (html.match(HEAD_TAG) ?? [])
    .map((tag) => tag.replace(/^<(\w+)/, "<$1 data-prerender"));
  html = html.replace(HEAD_TAG, "");

  let page = template;
  for (const re of OWNED_BY_PAGE) page = page.replace(re, "");

  // Hero-bilden är startsidans största element (LCP): förladda den så att
  // webbläsaren hämtar den direkt, innan CSS och JavaScript är klara.
  // En uppladdad hero-bild har srcset — då förladdas rätt storlek via imagesrcset.
  if (route === "/") {
    const img = html.match(/<img[^>]*fetchPriority="high"[^>]*>/i)?.[0] ?? "";
    const attr = (name) => img.match(new RegExp(`\\s${name}="([^"]+)"`, "i"))?.[1];
    const src = attr("src");
    if (src) {
      const srcset = attr("srcSet");
      const sizes  = attr("sizes");
      const extra  = srcset ? ` imagesrcset="${srcset}"${sizes ? ` imagesizes="${sizes}"` : ""}` : "";
      headTags.unshift(`<link data-prerender rel="preload" as="image" href="${src}"${extra} fetchpriority="high"/>`);
    }
  }

  page = page
    .replace("</head>", `    ${headTags.join("\n    ")}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

  const outDir = route === "/" ? distDir : path.join(distDir, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), page);
  console.log(`förrenderad: ${route} (${headTags.length} head-taggar)`);
}

fs.rmSync(ssrDir, { recursive: true, force: true });
