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

  // Företagsuppgifter (e-handelslagen 8 §), visas i sidfoten och
  // integritetspolicyn. Org.nr visas medvetet inte: för en enskild firma är
  // det innehavarens personnummer. Momsreg.nr räcker som identifiering.
  vatNumber:   "SE570303939501",

  // Adress, förtroenderad (ROT/F-skatt/försäkring), Google-omdömen och
  // sociala medier ställs in i admin → Inställningar (se lib/settings.ts).

  // SEO
  baseUrl:   "https://terrysallbygg.se",
  ogImage:   "https://terrysallbygg.se/og-image.jpg",   // 1200×630, används vid delning
  areaServed: ["Österlen", "Simrishamn", "Tomelilla", "Ystad", "Skåne"],

  // Svarstid för förfrågningar — samma löfte överallt på sajten
  responseTime: "Vi svarar inom 24 timmar på vardagar",
} as const;