import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageGallery from "../components/project/ImageGallery";
import PageMeta from "../components/PageMeta";
import NotFound from "./NotFound";
import { projectPath, bookPathFor } from "../lib/routes";
import { Phone } from "lucide-react";
import ProjectCard from "../components/project/ProjectCard";
import { CONTACT } from "../lib/contact";
import { paragraphs } from "../lib/settings";
import { serviceForProject, servicePath } from "../lib/services";
import RetryError from "../components/RetryError";
import { useFetch } from "../hooks/useFetch";
import { API, isNotFound, type ProjectDetail, type ProjectOverview } from "../lib/api";
import styles from "../pages.module.css";

export default function ProjectsPageContent() {
  const { id } = useParams();
  const { data: project, error, loading, reload } =
    useFetch<ProjectDetail>(id ? API.project(id) : null);
  // Fler projekt längst ner — samma lista som projektsidan (cachas av webbläsaren)
  const { data: allProjects } = useFetch<ProjectOverview[]>(API.projects);
  const moreProjects = (allProjects ?? []).filter((p) => p.id !== id).slice(0, 3);

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

  const service = serviceForProject(project.title, project.description);

  return (
    <div className={styles.page}>
      <PageMeta
        title={project.title}
        description={project.description}
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
            {service && (
              <p className={styles.descriptionText}>
                Läs mer om <Link to={servicePath(service.slug)}>{service.name.toLowerCase()}</Link> och hur vi arbetar.
              </p>
            )}
          </section>

          {/* Nästa steg för den som gillar projektet */}
          <aside className={styles.projectCta} aria-labelledby="project-cta-title">
            <h2 id="project-cta-title" className={styles.projectCtaTitle}>Vill du ha något liknande?</h2>
            <p className={styles.projectCtaText}>
              Berätta om ditt projekt så återkommer vi inom 24 timmar på vardagar.
              Konsultationen är kostnadsfri.
            </p>
            <div className={styles.projectCtaButtons}>
              <Link to={bookPathFor(project.title)} className={styles.btnPrimary}>Boka konsultation</Link>
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