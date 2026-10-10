import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";

// Förrenderade head-taggar (scripts/prerender.mjs) ersätts av dem React
// renderar från <PageMeta>, annars skulle de finnas dubbelt.
document.querySelectorAll("[data-prerender]").forEach((el) => el.remove());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);