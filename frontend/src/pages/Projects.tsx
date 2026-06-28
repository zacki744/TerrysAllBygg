import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageGallery from "../components/project/ImageGallery";
import Button from "../components/ui/Button";
import PageMeta from "../components/PageMeta";
import styles from "../pages.module.css";

interface Project {
  title: string;
  description: string;
  images: string[];
}

export default function ProjectsPageContent() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/projects/details/${id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  // ── State views — share consistent shell ──────────────────
  if (!id || loading || !project) {
    const msg = !id ? "Inget projekt valt." : loading ? "Laddar…" : "Projektet hittades inte.";
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>{msg}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {project && (
        <PageMeta title={project.title} description={project.description} canonical="/projects" />
      )}
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
        <ImageGallery images={project.images} title={project.title} />

        {/* Beskrivning + knapp begränsas i bredd för läsbarhet */}
        <div className={styles.projectDetailMain}>
          <section className={styles.descriptionSection}>
            <h2 className={styles.descriptionTitle}>Beskrivning</h2>
            <p className={styles.descriptionText}>{project.description}</p>
          </section>

          <div style={{ marginTop: "1.5rem" }}>
            <Button>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                ← Tillbaka till projekt
              </Link>
            </Button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}