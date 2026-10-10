// src/entry-server.tsx
// ── Förrendering vid build (körs av scripts/prerender.mjs, aldrig i webbläsaren) ──
// Renderar en sida till HTML så att sökmotorer och delningar i sociala medier
// ser innehåll och rätt titel/beskrivning utan att köra JavaScript.
// <title>/<meta>/<link> från <PageMeta> följer med i HTML:en (React 19) och
// flyttas till <head> av prerender-skriptet.

import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppRoutes } from "./App";

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <HelmetProvider>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>
  );
}
