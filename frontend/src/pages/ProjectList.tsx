// src/pages/ProjectList.tsx
// ── /projekt — alla tidigare projekt ──

import { Link, useSearchParams } from "react-router-dom";
import { useSettings } from "../lib/settingsContext";
import { findCategory } from "../lib/categories";
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
  const { categories } = useSettings();
  const [params, setParams] = useSearchParams();

  // Filter per kategori — knappar bara för kategorier som har projekt.
  // En länk till en kategori utan projekt (t.ex. från startsidan) visar alla
  // projekt med en förklaring, i stället för en tom sida.
  const used = categories.filter((c) => all.some((p) => p.category === c.slug));
  const requested = findCategory(categories, params.get("kategori"));
  const active = used.find((c) => c.slug === requested?.slug);
  const emptyRequest = !loading && !error && requested && !active;
  const projects = active ? all.filter((p) => p.category === active.slug) : all;
  const select = (slug: string | null) =>
    setParams(slug ? { kategori: slug } : {}, { replace: true, preventScrollReset: true });

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

      {/* Under laddning: håll plats för filterraden så att korten inte hoppar ner */}
      {loading && categories.length > 0 && <div className={styles.filterChipsPlaceholder} aria-hidden />}

      {used.length > 0 && (
        <div className={styles.filterChips} role="group" aria-label="Visa projekt för">
          <button type="button" className={styles.filterChip} aria-pressed={!active} onClick={() => select(null)}>
            Alla
          </button>
          {used.map((c) => (
            <button key={c.slug} type="button" className={styles.filterChip}
              aria-pressed={active?.slug === c.slug} onClick={() => select(c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      {emptyRequest && (
        <p className={styles.infoBox} role="status" style={{ marginBottom: "1.5rem" }}>
          Vi har inga bilder från {requested.name.toLowerCase()} upplagda än – här är alla våra projekt.
          {" "}<Link to={`/book?kategori=${requested.slug}`}>Fråga oss gärna</Link> om ditt projekt.
        </p>
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
