"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ImageGallery from "@/app/components/project/ImageGallery";
import Button from "@/app/components/ui/Button";
import styles from "../pages.module.css";
import Link from "next/link";

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

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainWide} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        <header className={styles.projectHeader}>
          <h1 className={styles.projectTitle}>{project.title}</h1>
        </header>

        {/* Gallery — full width, no wrapper box */}
        <ImageGallery images={project.images} title={project.title} />

        {/* Description */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Beskrivning</h2>
          <p className={styles.descriptionText}>{project.description}</p>
        </section>

        <div>
          <Button>
            <Link href="/">← Tillbaka till projekt</Link>
          </Button>
        </div>

      </main>

      <Footer />
    </div>
  );
}