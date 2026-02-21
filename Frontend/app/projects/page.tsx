"use client";

import { Suspense } from "react";
import ProjectsPageContent from "@/app/projects/ProjectsPageContent";
import styles from "../pages.module.css";

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageCenter}>
          <p>Laddar…</p>
        </div>
      }
    >
      <ProjectsPageContent />
    </Suspense>
  );
}
