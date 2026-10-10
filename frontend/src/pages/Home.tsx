import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "./../components/Navbar";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import ProjectCard from "./../components/project/ProjectCard";
import { ProjectCardSkeleton } from "./../components/Skeletons";
import RetryError from "./../components/RetryError";
import PageMeta from "./../components/PageMeta";
import styles from "./../pages.module.css";
import { Check } from "lucide-react";
import { CONTACT } from "../lib/contact";

// Punkter som styrs av inställningar i contact.ts visas bara när de stämmer
const TRUST_ITEMS = [
  CONTACT.trust.rotDeduction && "ROT-avdrag direkt på fakturan",
  "Kostnadsfri konsultation",
  "Lokalt företag på Österlen",
  CONTACT.trust.fTax && "Godkänd för F-skatt",
  CONTACT.trust.insured && "Ansvarsförsäkrad",
].filter((t): t is string => Boolean(t));

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
        timer.current = setTimeout(() => data.slice(3).forEach((p) => prefetchImage(p.image)), 2000);
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

      <Hero />

      <ul className={styles.trustBar} aria-label="Därför Terrys Allbygg">
        {TRUST_ITEMS.map((t) => (
          <li key={t} className={styles.trustItem}>
            <Check size={15} strokeWidth={2.5} className={styles.trustIcon} aria-hidden />{t}
          </li>
        ))}
      </ul>

      <main className={styles.mainWide}>

        {/* ── Projekt ── */}
        <section className={styles.projectsSection}>
          <h2 className={styles.sectionTitle}>Tidigare projekt</h2>
          <div className={styles.projectGrid}>
            {loading && Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            {!loading && error && <RetryError />}
            {!loading && !error && projects.map((p, i) => (
              <ProjectCard key={p.id} {...p} priority={i < 3} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className={styles.homeCta}>
          <p className={styles.homeCtaTitle}>Redo att sätta igång?</p>
          <p className={styles.homeCtaSubtitle}>
            Vi erbjuder kostnadsfri konsultation — berätta om ditt projekt
            så återkommer vi inom 24 timmar.
          </p>
          <div className={styles.homeCtaButtons}>
            <Link to="/book"       className={styles.btnPrimary}>Boka konsultation</Link>
            <Link to="/snickerier" className={styles.btnGhost}>Se snickerier</Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}