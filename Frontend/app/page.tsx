import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Hem | Terrys All Bygg",
  description:
    "Terrys All Bygg — lokalt byggföretag i Österlen, Skåne. " +
    "Vi bygger bastuer, tillbyggnader, förråd och skräddarsydda snickerier.",
  alternates:  { canonical: "/" },
};

export default function HomePage() {
  return <HomeClient />;
}