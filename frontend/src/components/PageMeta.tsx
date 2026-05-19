import { Helmet } from "react-helmet-async";
import { CONTACT } from "../lib/contact";

interface PageMetaProps {
  title?: string;
  description?: string;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
  product?: {
    name: string;
    description: string;
    price: number;
    image: string;
  };
}

const DEFAULT_DESCRIPTION =
  "Terrys All Bygg är ditt lokala byggföretag i Österlen, Skåne. " +
  "Vi uppför bastuer, tillbyggnader, förråd och skräddarsydda snickerier med hög kvalitet och omsorg.";

const DEFAULT_KEYWORDS = [
  "byggföretag Österlen",
  "byggare Skåne",
  "bygga bastu Österlen",
  "tillbyggnad Skåne",
  "snickerier Österlen",
  "förråd bygga",
  "trädgårdsstudio Skåne",
  "hantverkare Österlen",
  "Terrys All Bygg",
  "snickare Österlen",
  "altan byggare Skåne",
].join(", ");

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": CONTACT.baseUrl,
  "name": CONTACT.companyName,
  "description": DEFAULT_DESCRIPTION,
  "url": CONTACT.baseUrl,
  "telephone": CONTACT.phone,
  "email": CONTACT.email,
  "image": CONTACT.ogImage,
  "logo": `${CONTACT.baseUrl}/android-chrome-512x512.png`,
  "address": {
    "@type": "PostalAddress",
    "streetAddress":   CONTACT.address.street,
    "addressLocality": CONTACT.address.city,
    "addressRegion":   CONTACT.address.region,
    "postalCode":      CONTACT.address.postcode,
    "addressCountry":  "SE",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude":  CONTACT.geo.lat,
    "longitude": CONTACT.geo.lng,
  },
  "areaServed": CONTACT.areaServed.map(name => ({
    "@type": "City", "name": name,
  })),
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens":  "07:00",
      "closes": "17:00",
    },
  ],
  "sameAs": [
    CONTACT.social.facebook,
    CONTACT.social.instagram,
  ].filter(Boolean),
};

export default function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical = "/",
  noIndex = false,
  ogImage = CONTACT.ogImage,
  ogType = "website",
  product,
}: PageMetaProps) {
  const fullTitle    = title
    ? `${title} | ${CONTACT.companyName}`
    : `${CONTACT.companyName} — Byggföretag i Österlen, Skåne`;
  const canonicalUrl = `${CONTACT.baseUrl}${canonical}`;

  const productSchema = product ? {
    "@context": "https://schema.org",
    "@type":    "Product",
    "name":        product.name,
    "description": product.description,
    "image": product.image.startsWith("http")
      ? product.image
      : `${CONTACT.baseUrl}${product.image}`,
    "brand": { "@type": "Brand", "name": CONTACT.companyName },
    "offers": {
      "@type":        "Offer",
      "priceCurrency": "SEK",
      "price":         product.price,
      "availability":  "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": CONTACT.companyName },
    },
  } : null;

  const breadcrumbSchema = canonical !== "/" ? {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Hem",          "item": CONTACT.baseUrl },
      { "@type": "ListItem", "position": 2, "name": title ?? "Sida","item": canonicalUrl },
    ],
  } : null;

  return (
    <Helmet>
      <html lang="sv" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords"    content={DEFAULT_KEYWORDS} />
      <meta name="author"      content={CONTACT.companyName} />
      <meta name="robots"      content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <link rel="canonical"    href={canonicalUrl} />

      <meta name="geo.region"    content="SE-M" />
      <meta name="geo.placename" content={`${CONTACT.address.city}, ${CONTACT.address.region}`} />
      <meta name="ICBM"          content={`${CONTACT.geo.lat}, ${CONTACT.geo.lng}`} />

      <meta property="og:type"        content={ogType} />
      <meta property="og:locale"      content="sv_SE" />
      <meta property="og:site_name"   content={CONTACT.companyName} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}