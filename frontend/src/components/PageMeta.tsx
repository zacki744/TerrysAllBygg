import { Helmet } from "react-helmet-async";
import { CONTACT } from "../lib/contact";
import {
  absoluteUrl, breadcrumbSchema, businessSchema, productSchema,
  serviceSchema, websiteSchema,
  type Crumb, type ProductInfo,
} from "../lib/schema";
import { clampDescription } from "../lib/meta";
import { useSettings } from "../lib/settingsContext";
import type { Service } from "../lib/services";

interface PageMetaProps {
  /** Sidans namn. Blir "<title> | Terrys Allbygg". Utelämna på startsidan. */
  title?: string;
  /** 120–160 tecken. Visas som utdrag i sökresultaten. */
  description?: string;
  /** Sökväg, t.ex. "/projekt". Blir absolut canonical-URL. */
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
  /** Brödsmulor efter "Hem". Standard: en nivå med sidans titel. */
  breadcrumbs?: Crumb[];
  product?: Omit<ProductInfo, "url">;
  /** Tjänstesida → schema.org/Service */
  service?: Service;
}

const DEFAULT_DESCRIPTION =
  "Terrys Allbygg är ett lokalt bygg- och snickeriföretag på Österlen. " +
  "Vi bygger bastuer, tillbyggnader, altaner, förråd och snickerier i hela Skåne.";

// Sidor där hela företagsbeskrivningen (adress, tjänster, öppettider) hör hemma
const BUSINESS_PAGES = ["/", "/about"];

export default function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical = "/",
  noIndex = false,
  ogImage = CONTACT.ogImage,
  ogType = "website",
  breadcrumbs,
  product,
  service,
}: PageMetaProps) {
  const settings     = useSettings();
  description        = clampDescription(description);
  const isHome       = canonical === "/";
  const fullTitle    = title
    ? `${title} | ${CONTACT.companyName}`
    : `${CONTACT.companyName} – Bygg och snickeri på Österlen`;
  const canonicalUrl = absoluteUrl(canonical);
  const ogImageUrl   = absoluteUrl(ogImage);          // sociala medier kräver absoluta URL:er
  const isDefaultOg  = ogImage === CONTACT.ogImage;

  const schemas: object[] = [];
  if (isHome) schemas.push(websiteSchema());
  if (BUSINESS_PAGES.includes(canonical)) schemas.push(businessSchema(settings));
  if (!isHome && !noIndex) {
    schemas.push(breadcrumbSchema(breadcrumbs ?? [{ name: title ?? "Sida", path: canonical }]));
  }
  if (product) schemas.push(productSchema({ ...product, url: canonical }));
  if (service) schemas.push(serviceSchema(service));

  return (
    <Helmet>
      <html lang="sv" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      {!noIndex && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type"         content={ogType} />
      <meta property="og:locale"       content="sv_SE" />
      <meta property="og:site_name"    content={CONTACT.companyName} />
      <meta property="og:title"        content={title ?? fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:url"          content={canonicalUrl} />
      <meta property="og:image"        content={ogImageUrl} />
      {isDefaultOg && <meta property="og:image:width"  content="1200" />}
      {isDefaultOg && <meta property="og:image:height" content="630" />}

      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={title ?? fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImageUrl} />

      {schemas.map((s, i) => (
        // "<" escapas: adress m.m. kommer från admin och får aldrig kunna avsluta taggen
        <script key={i} type="application/ld+json">{JSON.stringify(s).replace(/</g, "\\u003c")}</script>
      ))}
    </Helmet>
  );
}
