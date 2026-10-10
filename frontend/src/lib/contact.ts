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

  // Företagsuppgifter — krävs enligt e-handelslagen (8 §) och visas i
  // sidfoten och integritetspolicyn. Fyll i innan driftsättning;
  // tomma fält döljs automatiskt.
  orgNumber:   "570303-9395",
  vatNumber:   "SE570303939501",   // momsreg.nr = SE + org.nr + 01
  address:     "",   // TODO: "Gatuadress, Postnr Ort"

  // Förtroende — visas i förtroenderaden på startsidan när de är true.
  // Sätt bara true för det som faktiskt stämmer.
  trust: {
    rotDeduction: false,  // TODO: true om ni drar av ROT direkt på fakturan
    fTax:         false,  // TODO: true om företaget har F-skatt
    insured:      false,  // TODO: true om ansvarsförsäkring finns
  },

  // Länk till Google-profilens omdömen (visas i sidfoten när ifylld)
  googleReviewsUrl: "",   // TODO: "https://g.page/r/…"

  // Sociala medier — lägg till om de finns
  social: {
    facebook:  "",   // "https://facebook.com/terrysallbygg"
    instagram: "",   // "https://instagram.com/terrysallbygg"
  },

  // SEO
  baseUrl:   "https://terrysallbygg.se",
  ogImage:   "https://terrysallbygg.se/og-image.jpg",   // 1200×630, används vid delning
  areaServed: ["Österlen", "Simrishamn", "Tomelilla", "Ystad", "Skåne"],
} as const;