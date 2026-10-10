// src/lib/schema.ts
// ══════════════════════════════════════════════════════════
// Strukturerad data (schema.org, JSON-LD) för Google.
// Testa ändringar på https://search.google.com/test/rich-results
// ══════════════════════════════════════════════════════════

import { CONTACT } from "./contact";
import { SERVICES } from "./services";

const BUSINESS_ID = `${CONTACT.baseUrl}/#foretag`;
const SITE_ID     = `${CONTACT.baseUrl}/#webbplats`;

export const absoluteUrl = (pathOrUrl: string) =>
  pathOrUrl.startsWith("http") ? pathOrUrl : `${CONTACT.baseUrl}${pathOrUrl}`;

/** Företaget. GeneralContractor är en undertyp av LocalBusiness för byggfirmor. */
export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": BUSINESS_ID,
    name: CONTACT.companyName,
    alternateName: "TerrysAllBygg",          // namnet på Google-profilen
    url: CONTACT.baseUrl,
    telephone: CONTACT.phoneHref.replace("tel:", ""),
    email: CONTACT.email,
    image: CONTACT.ogImage,
    logo: absoluteUrl("/android-chrome-512x512.png"),
    ...(CONTACT.vatNumber ? { vatID: CONTACT.vatNumber } : {}),
    address: {
      "@type": "PostalAddress",
      ...(CONTACT.address ? { streetAddress: CONTACT.address } : {}),
      addressRegion: "Skåne",
      addressCountry: "SE",
    },
    areaServed: CONTACT.areaServed.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "16:00",
    }],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Tjänster",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.detail ? `${s.name} ${s.detail}` : s.name,
          areaServed: "Österlen, Skåne",
        },
      })),
    },
    sameAs: [CONTACT.googleReviewsUrl, CONTACT.social.facebook, CONTACT.social.instagram]
      .filter(Boolean),
  };
}

/** Ger Google underlag för sajtnamnet som visas i sökresultaten. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: CONTACT.companyName,
    alternateName: "TerrysAllBygg",
    url: `${CONTACT.baseUrl}/`,
    inLanguage: "sv-SE",
    publisher: { "@id": BUSINESS_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Brödsmulor: Hem › …crumbs. Sista ledet är den aktuella sidan. */
export function breadcrumbSchema(crumbs: Crumb[]) {
  const all = [{ name: "Hem", path: "/" }, ...crumbs];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export interface ProductInfo {
  name: string;
  description: string;
  price: number;
  image: string;
  url: string;
}

export function productSchema(p: ProductInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: absoluteUrl(p.image),
    brand: { "@type": "Brand", name: CONTACT.companyName },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(p.url),
      priceCurrency: "SEK",
      price: p.price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": BUSINESS_ID },
    },
  };
}
