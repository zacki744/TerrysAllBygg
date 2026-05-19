import { useEffect, useState } from "react";
import Navbar from "./../components/Navbar";
import Hero from "./../components/Hero";
import ProjectCard from "./../components/project/ProjectCard";
import { ProjectCardSkeleton } from "./../components/Skeletons";
import Footer from "./../components/Footer";
import PageMeta from "./../components/PageMeta";
import styles from "./../pages.module.css";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
}

export default function Home() {
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
    <div className={styles.page}>
      <PageMeta
        canonical="/"
        description="Terrys All Bygg — lokalt byggföretag i Österlen, Skåne. Vi bygger bastuer, tillbyggnader, förråd, altaner och skräddarsydda snickerier med fokus på kvalitet och hållbarhet."
      />
      <Navbar />

      <div className={styles.mainWide}>
        <Hero />
      </div>

      <main className={styles.mainWide}>
        <section className={styles.projectsSection}>
          <h2 className={styles.sectionTitle}>Tidigare projekt</h2>

          <div className={styles.projectGrid}>
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}

            {!loading && error && (
              <p className={styles.stateText}>
                Kunde inte ladda projekt. <button
                  onClick={() => window.location.reload()}
                  style={{ color: "var(--accent)", background: "none", border: "none",
                    cursor: "pointer", textDecoration: "underline" }}>
                  Försök igen
                </button>
              </p>
            )}

            {!loading && !error && projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                image={project.image}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}