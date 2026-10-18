import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageGallery from "../components/project/ImageGallery";
import PageMeta from "../components/PageMeta";
import NotFound from "./NotFound";
import { projectPath, bookPathFor, projectPageTitle, projectMetaDescription } from "../lib/routes";
import { Phone } from "lucide-react";
import ProjectCard from "../components/project/ProjectCard";
import { CONTACT } from "../lib/contact";
import { paragraphs } from "../lib/settings";
import { findCategory, categoryPath } from "../lib/categories";
import { useSettings } from "../lib/settingsContext";
import RetryError from "../components/RetryError";
import { useFetch } from "../hooks/useFetch";
import { API, isNotFound, type ProjectDetail, type ProjectOverview } from "../lib/api";
import styles from "../pages.module.css";

export default function ProjectsPageContent() {
  const { categories } = useSettings();
  const { id } = useParams();
  const { data: project, error, loading, reload } =
    useFetch<ProjectDetail>(id ? API.project(id) : null);
  // Fler projekt längst ner — samma lista som projektsidan (cachas av webbläsaren)
  const { data: allProjects } = useFetch<ProjectOverview[]>(API.projects);
  // Projekt i samma kategori först
  const moreProjects = (allProjects ?? [])
    .filter((p) => p.id !== id)
    .sort((a, b) => Number(b.category === project?.category) - Number(a.category === project?.category))
    .slice(0, 3);

  // ── State views — share consistent shell ──────────────────
  if (!id || isNotFound(error)) return <NotFound />;

  if (loading || !project) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          {error ? <RetryError onRetry={reload} /> : <p className={styles.stateText}>Laddar…</p>}
        </main>
        <Footer />
      </div>
    );
  }

  const category = findCategory(categories, project.category);
  // Faktarad: bara det som är ifyllt
  const facts = [
    project.location && { label: "Ort", value: project.location },
    project.year && { label: "År", value: String(project.year) },
    project.scope && { label: "Omfattning", value: project.scope },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  return (
    <div className={styles.page}>
      <PageMeta
        title={projectPageTitle(project.title, project.location)}
        description={projectMetaDescription(project.title, project.description, project.location)}
        canonical={projectPath(id, project.title)}
        breadcrumbs={[
          { name: "Projekt", path: "/projekt" },
          { name: project.title, path: projectPath(id, project.title) },
        ]}
        ogImage={project.images[0]}
      />
      <Navbar />

      {/*
        Använder mainWide för galleriet (full bredd behövs),
        men begränsar text-sektionerna med projectDetailMain
      */}
      <main className={styles.mainWide} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        <header className={styles.projectHeader}>
          <h1 className={styles.projectTitle}>{project.title}</h1>
          {(facts.length > 0 || category) && (
            <dl className={styles.projectFacts}>
              {facts.map((f) => (
                <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>
              ))}
              {category && (
                <div><dt>Kategori</dt><dd><Link to={categoryPath(category.slug)}>{category.name}</Link></dd></div>
              )}
            </dl>
          )}
        </header>

        {/* Gallery — full mainWide bredd */}
        <ImageGallery key={id} images={project.images} title={project.title} />

        {/* Beskrivning + knapp begränsas i bredd för läsbarhet */}
        <div className={styles.projectDetailMain}>
          <section className={styles.descriptionSection}>
            <h2 className={styles.descriptionTitle}>Beskrivning</h2>
            {paragraphs(project.description).map((p, i) => (
              <p key={i} className={styles.descriptionText}>{p}</p>
            ))}

          </section>

          {/* Nästa steg för den som gillar projektet */}
          <aside className={styles.projectCta} aria-labelledby="project-cta-title">
            <h2 id="project-cta-title" className={styles.projectCtaTitle}>Vill du ha något liknande?</h2>
            <p className={styles.projectCtaText}>
              Berätta om ditt projekt så återkommer vi inom 24 timmar på vardagar.
              Konsultationen är kostnadsfri.
            </p>
            <div className={styles.projectCtaButtons}>
              <Link to={bookPathFor(project.title, category?.slug)} className={styles.btnPrimary}>Boka konsultation</Link>
              <a href={CONTACT.phoneHref} className={`${styles.btnGhost} ${styles.iconLine}`}>
                <Phone size={16} aria-hidden /> Ring {CONTACT.phone}
              </a>
            </div>
          </aside>

          {moreProjects.length === 0 && (
            <div style={{ marginTop: "1.5rem" }}>
              <Link to="/projekt" className={styles.btnGhost}>← Alla projekt</Link>
            </div>
          )}
        </div>

        {moreProjects.length > 0 && (
          <section className={styles.moreProjects} aria-labelledby="more-projects">
            <div className={styles.sectionHeader}>
              <h2 id="more-projects" className={styles.sectionTitle}>Fler projekt</h2>
              <Link to="/projekt" className={styles.sectionLink}>Alla projekt</Link>
            </div>
            <div className={styles.projectGrid}>
              {moreProjects.map((p) => <ProjectCard key={p.id} {...p} />)}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}