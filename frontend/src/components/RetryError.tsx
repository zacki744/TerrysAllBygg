import { useEffect, useState, useRef } from "react";
import Navbar from "./../components/Navbar";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import ProjectCard from "./../components/project/ProjectCard";
import { ProjectCardSkeleton } from "./../components/Skeletons";
import RetryError from "./../components/RetryError";
import PageMeta from "./../components/PageMeta";
import styles from "./../pages.module.css";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
}

const prefetched = new Set<string>();
function prefetchImage(url: string) {
  if (prefetched.has(url)) return;
  prefetched.add(url);
  const link = document.createElement("link");
  link.rel = "prefetch"; link.as = "image"; link.href = url;
  document.head.appendChild(link);
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: Project[]) => {
        setProjects(data);
        timer.current = setTimeout(() => data.slice(2).forEach((p) => prefetchImage(p.image)), 2000);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  return (
    <div className={styles.page}>
      <PageMeta
        canonical="/"
        description="Terrys Allbygg — lokalt byggföretag i Österlen, Skåne. Vi bygger bastuer, tillbyggnader, förråd, altaner och skräddarsydda snickerier med fokus på kvalitet och hållbarhet."
      />
      <Navbar />

      <div className={styles.heroContainer}><Hero /></div>

      <div className={styles.trustBar}>
        {["Lokalt företag i Österlen", "Kostnadsfri konsultation", "Skräddarsydda lösningar"].map((t) => (
          <span key={t} className={styles.trustItem}>
            <span className={styles.trustDot} />{t}
          </span>
        ))}
      </div>

      <main className={styles.mainWide}>
        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tidigare projekt</h2>
          </div>
          <div className={styles.projectGrid}>
            {loading && Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            {!loading && error && <RetryError />}
            {!loading && !error && projects.map((p, i) => (
              <ProjectCard key={p.id} {...p} priority={i < 2} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}