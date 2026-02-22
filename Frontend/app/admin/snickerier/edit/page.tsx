"use client";

import { Suspense } from "react";
import EditSnickeriContent from "./EditSnickeriContent";
import styles from "../../admin.module.css";

export default function EditSnickeri() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageCenter}>
          <p className={styles.loadingText}>Laddar...</p>
        </div>
      }
    >
      <EditSnickeriContent />
    </Suspense>
  );
}
