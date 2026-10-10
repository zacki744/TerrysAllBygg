import { Link } from "react-router-dom";
import Navbar from "./../components/Navbar";
import Footer from "./../components/Footer";
import Hero from "./../components/Hero";
import ProjectCard from "./../components/project/ProjectCard";
import { ProjectCardSkeleton } from "./../components/Skeletons";
import RetryError from "./../components/RetryError";
import PageMeta from "./../components/PageMeta";
import styles from "./../pages.module.css";
import { useFetch } from "../hooks/useFetch";
import { API, type ProjectOverview } from "../lib/api";
import { Check } from "lucide-react";
import { CONTACT } from "../lib/contact";
import { SERVICES } from "../lib/services";

const HOME_PROJECT_COUNT = 6;

// Punkter som styrs av inställningar i contact.ts visas bara när de stämmer
const TRUST_ITEMS = [
  CONTACT.trust.rotDeduction && "ROT-avdrag direkt på fakturan",
  "Kostnadsfri konsultation",
  "Lokalt företag på Österlen",
  CONTACT.trust.fTax && "Godkänd för F-skatt",
  CONTACT.trust.insured && "Ansvarsförsäkrad",
].filter((t): t is string => Boolean(t));


export default function Home() {
  const { data, loading, error, reload } = useFetch<ProjectOverview[]>(API.projects);
  const projects = data ?? [];

  return (
    <div className={styles.page}>
      <PageMeta
        canonical="/"
        description="Lokalt bygg- och snickeriföretag på Österlen. Vi bygger bastuer, tillbyggnader, altaner, förråd och trädgårdsstudios i Simrishamn, Tomelilla, Ystad och Skåne."
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
        <section className={styles.projectsSection} aria-labelledby="home-projects">
          <div className={styles.sectionHeader}>
            <h2 id="home-projects" className={styles.sectionTitle}>Tidigare projekt</h2>
            <Link to="/projekt" className={styles.sectionLink}>
              {projects.length > HOME_PROJECT_COUNT ? `Se alla ${projects.length} projekt` : "Se alla projekt"}
            </Link>
          </div>
          <div className={styles.projectGrid}>
            {loading && Array.from({ length: HOME_PROJECT_COUNT }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            {!!error && <RetryError onRetry={reload} />}
            {!loading && !error && projects.slice(0, HOME_PROJECT_COUNT).map((p, i) => (
              <ProjectCard key={p.id} {...p} priority={i < 3} />
            ))}
          </div>
        </section>

        {/* ── Tjänster ── */}
        <section className={styles.servicesSection} aria-labelledby="home-services">
          <h2 id="home-services" className={styles.sectionTitle}>Det här bygger vi</h2>
          <p className={styles.servicesLead}>
            Vi tar oss an byggprojekt i hela {CONTACT.areaServed.slice(0, -1).join(", ")} och
            resten av Skåne, från första skiss till färdigt bygge.
          </p>
          <ul className={styles.servicesList}>
            {SERVICES.map((s) => (
              <li key={s.name}>
                <span className={styles.servicesName}>{s.name}</span>
                {s.detail && <span className={styles.servicesDetail}> {s.detail}</span>}
              </li>
            ))}
          </ul>
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