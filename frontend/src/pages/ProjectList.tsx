// src/pages/ProjectList.tsx
// ── /projekt — alla tidigare projekt ──

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import ProjectCard from "../components/project/ProjectCard";
import { ProjectCardSkeleton } from "../components/Skeletons";
import RetryError from "../components/RetryError";
import styles from "../pages.module.css";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setProjects)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell wide>
      <PageMeta
        title="Projekt"
        description="Bastuer, tillbyggnader, altaner och förråd som Terrys Allbygg byggt på Österlen. Se bilder från tidigare projekt."
        canonical="/projekt"
      />

      <header className={styles.listHeader}>
        <h1 className={styles.pageTitle}>Tidigare projekt</h1>
        <p className={styles.pageSubtitle}>
          Ett urval av det vi byggt på Österlen. Klicka på ett projekt för fler bilder.
        </p>
      </header>

      <div className={styles.projectGrid}>
        {loading && Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        {!loading && error && <RetryError />}
        {!loading && !error && projects.length === 0 && (
          <p className={styles.stateText}>Inga projekt publicerade än.</p>
        )}
        {!loading && !error && projects.map((p, i) => (
          <ProjectCard key={p.id} {...p} priority={i < 3} />
        ))}
      </div>

      <div className={styles.homeCta}>
        <p className={styles.homeCtaTitle}>Har du ett liknande projekt?</p>
        <p className={styles.homeCtaSubtitle}>
          Berätta vad du vill bygga, så återkommer vi med ett förslag. Konsultationen är kostnadsfri.
        </p>
        <div className={styles.homeCtaButtons}>
          <Link to="/book" className={styles.btnPrimary}>Boka konsultation</Link>
        </div>
      </div>
    </PageShell>
  );
}
