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

// Håll i synk med StaticPaths i TABB/API/Controllers/SitemapController.cs
const ROUTES = ["/", "/projekt", "/snickerier", "/about", "/book", "/integritetspolicy"];

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
fs.writeFileSync(path.join(distDir, "index.spa.html"), template);

const { render } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);

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
  let html = render(route);

  // Flytta head-taggarna till <head>. data-prerender gör att main.tsx kan ta
  // bort dem innan React lägger in sina egna, så att inget dubbleras.
  const headTags = (html.match(HEAD_TAG) ?? [])
    .map((tag) => tag.replace(/^<(\w+)/, "<$1 data-prerender"));
  html = html.replace(HEAD_TAG, "");

  let page = template;
  for (const re of OWNED_BY_PAGE) page = page.replace(re, "");

  // Hero-bilden är startsidans största element (LCP): förladda den så att
  // webbläsaren hämtar den direkt, innan CSS och JavaScript är klara.
  if (route === "/") {
    const hero = html.match(/<img[^>]*fetchPriority="high"[^>]*src="([^"]+)"|<img[^>]*src="([^"]+)"[^>]*fetchPriority="high"/i);
    const src = hero?.[1] ?? hero?.[2];
    if (src) headTags.unshift(`<link data-prerender rel="preload" as="image" href="${src}" fetchpriority="high"/>`);
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
