// src/lib/contact.ts
// ══════════════════════════════════════════════════════════
// Enda stället där kontaktinformation definieras.
// Importera härifrån i Footer, PageMeta, Book m.fl. Mejlen från servern har
// samma uppgifter i TABB/Services/Src/Mail/EmailLayout.cs (Brand).
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

  // Adress, förtroenderad (ROT/F-skatt/försäkring), Google-omdömen och
  // sociala medier ställs in i admin → Inställningar (se lib/settings.ts).

  // SEO
  baseUrl:   "https://terrysallbygg.se",
  ogImage:   "https://terrysallbygg.se/og-image.jpg",   // 1200×630, används vid delning
  areaServed: ["Österlen", "Simrishamn", "Tomelilla", "Ystad", "Skåne"],
} as const;