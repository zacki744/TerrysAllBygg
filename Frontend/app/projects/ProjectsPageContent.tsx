"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProjectMeta from "@/app/components/project/ProjectMeta";
import ImageGallery from "@/app/components/project/ImageGallery";
import Button from "@/app/components/ui/Button";
import styles from "../pages.module.css";

export default function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/projects/details/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Project not found");
        return res.json();
      })
      .then(setProject)
      .catch((err) => {
        console.error(err);
        setProject(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ── No ID ──────────────────────────────────────────────────
  if (!id) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>Inget projekt valt.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>Laddar…</p>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────
  if (!project) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>Projektet hittades inte.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Project detail ─────────────────────────────────────────
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainWide} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        <header className={styles.projectHeader}>
          <h1 className={styles.projectTitle}>{project.title}</h1>
          <p className={styles.projectDescription}>{project.description}</p>
        </header>

        {/* Gallery + Sidebar */}
        <div className={styles.projectLayout}>
          <div className={styles.galleryPanel}>
            <ImageGallery images={project.images} title={project.title} />
          </div>

          <aside className={styles.sidebarPanel}>
            <h2 className={styles.sidebarTitle}>Projektinfo</h2>
            <ProjectMeta constructionDate={project.constructionDate} />

            <div className={styles.sidebarDetails}>
              <div>
                <p className={styles.detailLabel}>Plats</p>
                <p className={styles.detailValue}>Österlen, Skåne</p>
              </div>
              <div>
                <p className={styles.detailLabel}>Utfört av</p>
                <p className={styles.detailValue}>Terrys All Bygg</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Description */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Beskrivning</h2>
          <p className={styles.descriptionText}>{project.description}</p>
        </section>

        <Button>
          <a href="/">← Tillbaka till projekt</a>
        </Button>

      </main>

      <Footer />
    </div>
  );
}