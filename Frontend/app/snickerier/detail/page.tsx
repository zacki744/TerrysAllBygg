"use client";

import { Suspense } from "react";
import SnickeriPageContent from "./SnickeriPageContent";
import styles from "../../pages.module.css";

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