import { Suspense } from "react";
import SnickeriPageContent from "./SnickeriPageContent";
import styles from "../../pages.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snickeri | Terrys All Bygg",
  description: "Se detaljer och skicka en förfrågan om detta snickeri.",
  alternates: { canonical: "/snickerier/detalj" },
};
export default function SnickeriDetailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageCenter}>
          <p className={styles.stateText}>Laddar…</p>
        </div>
      }
    >
      <SnickeriPageContent />
    </Suspense>
  );
}