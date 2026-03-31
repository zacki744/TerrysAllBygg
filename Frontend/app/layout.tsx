import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://terrysallbygg.se";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Default — overridden per page ─────────────────────────
  title: {
    default: "Terrys All Bygg — Byggföretag i Österlen",
    template: "%s | Terrys All Bygg",   // "Snickerier | Terrys All Bygg"
  },
  // the icon image
  icons: {
    icon: "/og-image.jpeg",  // place a 512×512 image in /public/
  },


  description:
    "Terrys All Bygg är ditt lokala byggföretag i Österlen, Skåne. " +
    "Vi uppför bastuer, tillbyggnader, förråd och skräddarsydda snickerier med hög kvalitet.",

  keywords: [
    "byggföretag Österlen",
    "byggare Skåne",
    "bastu bygga",
    "tillbyggnad",
    "snickerier",
    "förråd",
    "Terrys All Bygg",
  ],

  authors: [{ name: "Terrys All Bygg" }],

  // ── Open Graph (Facebook, LinkedIn, iMessage previews) ────
  openGraph: {
    type:        "website",
    locale:      "sv_SE",
    url:         BASE_URL,
    siteName:    "Terrys All Bygg",
    title:       "Terrys All Bygg — Byggföretag i Österlen",
    description:
      "Skräddarsydda byggprojekt och snickerier i Österlen, Skåne. " +
      "Kontakta oss för konsultation.",
    images: [
      {
        url:    "/og-image.jpg",   // place a 1200×630 image in /public/
        width:  1200,
        height: 630,
        alt:    "Terrys All Bygg",
      },
    ],
  },

  // ── Twitter / X card ──────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    title:       "Terrys All Bygg — Byggföretag i Österlen",
    description: "Skräddarsydda byggprojekt och snickerier i Österlen, Skåne.",
    images:      ["/og-image.jpg"],
  },

  // ── Canonical + robots ────────────────────────────────────
  alternates: {
    canonical: BASE_URL,
  },

  robots: {
    index:  true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  );
}