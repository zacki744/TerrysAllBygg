import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Terrys All Bygg - Byggföretag i Österlen, Skåne",
  description:
    "Terrys All Bygg är ett lokalt byggföretag i Österlen, Skåne. Vi specialiserar oss på skräddarsydda byggprojekt som bastuer, tillbyggnader och förråd.",
  keywords: "bygg, byggföretag, österlen, skåne, bastu, tillbyggnad, förråd, renovering, snickare",
  authors: [{ name: "Terrys All Bygg" }],
  openGraph: {
    title: "Terrys All Bygg - Byggföretag i Österlen",
    description: "Skräddarsydda byggprojekt i Österlen, Skåne.",
    url: "https://terrysallbygg.se",
    siteName: "Terrys All Bygg",
    locale: "sv_SE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#c86b3c" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <main style={{ paddingTop: "5rem" }}>{children}</main>
      </body>
    </html>
  );
}
