import { Suspense } from "react";
import ProjectsPageContent from "@/app/projects/ProjectsPageContent";
import styles from "../pages.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projekt",
  description: "Se våra tidigare byggprojekt — bastuer, tillbyggnader, förråd och mer i Österlen, Skåne.",
  alternates: { canonical: "/projects" },
};
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
