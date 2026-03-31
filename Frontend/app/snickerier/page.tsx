import type { Metadata } from "next";
import SnickeriOverviewPage from "./SnickeriOverviewPage";

export const metadataSnickerier: Metadata = {
  title: "Snickerier",
  description:
    "Handgjorda snickerier färdiga att beställa — stolar, bord, hyllor och mer. " +
    "Kontakta oss för en förfrågan.",
  alternates:  { canonical: "/snickerier" },
  openGraph: {
    title:       "Snickerier | Terrys All Bygg",
    description: "Handgjorda snickerier — färdiga att beställa.",
    url:         "/snickerier",
  },
};
export default function SnickeriPage() {
  return <SnickeriOverviewPage />;
}