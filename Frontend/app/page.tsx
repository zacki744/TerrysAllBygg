"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProjectCard from "./components/project/ProjectCard";
import Footer from "./components/Footer";
import styles from "./pages.module.css";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainWide}>
        <Hero />

        <section className={styles.projectsSection}>
          <h2 className={styles.sectionTitle}>Tidigare projekt</h2>

          {loading && <p className={styles.stateText}>Laddar projekt…</p>}

          <div className={styles.projectGrid}>
            {projects.map((project) => (
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
