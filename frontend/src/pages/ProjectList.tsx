// src/pages/ProjectList.tsx
// ── /projekt — alla tidigare projekt ──

import { Link, useSearchParams } from "react-router-dom";
import { useSettings } from "../lib/settingsContext";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import ProjectCard from "../components/project/ProjectCard";
import { ProjectCardSkeleton } from "../components/Skeletons";
import RetryError from "../components/RetryError";
import styles from "../pages.module.css";
import { useFetch } from "../hooks/useFetch";
import { API, type ProjectOverview } from "../lib/api";


export default function ProjectList() {
  const { data, loading, error, reload } = useFetch<ProjectOverview[]>(API.projects);
  const all = data ?? [];
  const { services } = useSettings();
  const [params, setParams] = useSearchParams();

  // Filter per tjänst — bara tjänster som har projekt med etiketten
  const used = services.filter((s) => all.some((p) => p.service === s.slug));
  const active = used.find((s) => s.slug === params.get("tjanst"));
  const projects = active ? all.filter((p) => p.service === active.slug) : all;
  const select = (slug: string | null) =>
    setParams(slug ? { tjanst: slug } : {}, { replace: true, preventScrollReset: true });

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

      {used.length > 0 && (
        <div className={styles.filterChips} role="group" aria-label="Visa projekt för">
          <button type="button" className={styles.filterChip} aria-pressed={!active} onClick={() => select(null)}>
            Alla
          </button>
          {used.map((s) => (
            <button key={s.slug} type="button" className={styles.filterChip}
              aria-pressed={active?.slug === s.slug} onClick={() => select(s.slug)}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.projectGrid}>
        {loading && Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        {!!error && <RetryError onRetry={reload} />}
        {!loading && !error && projects.length === 0 && (
          <p className={styles.stateText}>Inga projekt publicerade än.</p>
        )}
        {!loading && !error && projects.map((p, i) => (
          <ProjectCard key={p.id} {...p} priority={i < 3} headingLevel={2} />
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
