// src/lib/contact.ts
// ══════════════════════════════════════════════════════════
// Enda stället där kontaktinformation definieras.
// Importera härifrån i Footer, PageMeta, Book, e-postmallar.
// ══════════════════════════════════════════════════════════

export const CONTACT = {
  companyName: "Terrys Allbygg",
  phone:       "076-820 59 61",
  phoneHref:   "tel:+46768205961",
  email:       "terrysallbygg@gmail.com",
  emailHref:   "mailto:terrysallbygg@gmail.com",


  // Sociala medier — lägg till om de finns
  social: {
    facebook:  "",   // "https://facebook.com/terrysallbygg"
    instagram: "",   // "https://instagram.com/terrysallbygg"
  },

  // SEO
  baseUrl:   "https://terrysallbygg.se",
  ogImage:   "https://terrysallbygg.se/og-image.ico",
  areaServed: ["Österlen", "Simrishamn", "Tomelilla", "Ystad", "Skåne"],
} as const;