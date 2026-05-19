// src/lib/contact.ts
// ══════════════════════════════════════════════════════════
// Enda stället där kontaktinformation definieras.
// Importera härifrån i Footer, PageMeta, Book, e-postmallar.
// ══════════════════════════════════════════════════════════

export const CONTACT = {
  companyName: "Terrys All Bygg",
  phone:       "07X-XXX XX XX",       // ← uppdatera
  phoneHref:   "tel:+467XXXXXXXX",    // ← uppdatera (e.164 format)
  email:       "info@terrysallbygg.se",
  emailHref:   "mailto:info@terrysallbygg.se",

  address: {
    street:   "Din Gatuadress X",     // ← uppdatera
    postcode: "XXX XX",               // ← uppdatera
    city:     "Österlen",
    region:   "Skåne",
    country:  "Sverige",
    full:     "Din Gatuadress X, XXX XX Österlen", // ← uppdatera
  },

  geo: {
    lat: 55.6,    // ← uppdatera med exakta koordinater
    lng: 14.2,
  },

  // Öppettider — visas i footer och PageMeta JSON-LD
  hours: {
    weekdays: "07:00–17:00",
    saturday: "Stängt",
    sunday:   "Stängt",
  },

  // Sociala medier — lägg till om de finns
  social: {
    facebook:  "",   // "https://facebook.com/terrysallbygg"
    instagram: "",   // "https://instagram.com/terrysallbygg"
  },

  // SEO
  baseUrl:   "https://terrysallbygg.se",
  ogImage:   "https://terrysallbygg.se/og-image.jpg",
  areaServed: ["Österlen", "Simrishamn", "Tomelilla", "Ystad", "Skåne"],
} as const;