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
import { Check, Star } from "lucide-react";
import { useSettings } from "../lib/settingsContext";
import { trustItems, reviewsUrl } from "../lib/settings";
import { CONTACT } from "../lib/contact";
import { categoryPath } from "../lib/categories";

const HOME_PROJECT_COUNT = 6;

// Hela rader i rutnätet (3 i bredd): 6, 3 eller alla om de är färre än 3
const homeCount = (n: number) => (n >= 6 ? 6 : n >= 3 ? 3 : n);

export default function Home() {
  const { data, loading, error, reload } = useFetch<ProjectOverview[]>(API.projects);
  const projects = data ?? [];
  const settings = useSettings();
  const reviews = reviewsUrl(settings);

  return (
    <div className={styles.page}>
      <PageMeta
        canonical="/"
        description="Lokalt bygg- och snickeriföretag på Österlen. Vi bygger bastuer, tillbyggnader, altaner, förråd och trädgårdsstudios i Simrishamn, Tomelilla, Ystad och Skåne."
      />
      <Navbar />

      <main>
      <Hero />

      <ul className={styles.trustBar} aria-label="Därför Terrys Allbygg">
        {trustItems(settings).map((t) => (
          <li key={t} className={styles.trustItem}>
            <Check size={15} strokeWidth={2.5} className={styles.trustIcon} aria-hidden />{t}
          </li>
        ))}
      </ul>

      <div className={styles.mainWide}>

        {/* ── Projekt ── */}
        <section className={styles.projectsSection} aria-labelledby="home-projects">
          <div className={styles.sectionHeader}>
            <h2 id="home-projects" className={styles.sectionTitle}>Tidigare projekt</h2>
            <Link to="/projekt" className={styles.sectionLink}>
              {projects.length > homeCount(projects.length) ? `Se alla ${projects.length} projekt` : "Se alla projekt"}
            </Link>
          </div>
          <div className={styles.projectGrid}>
            {loading && Array.from({ length: HOME_PROJECT_COUNT }).map((_, i) => <ProjectCardSkeleton key={i} />)}
            {!!error && <RetryError onRetry={reload} />}
            {!loading && !error && projects.slice(0, homeCount(projects.length)).map((p, i) => (
              <ProjectCard key={p.id} {...p} priority={i < 3} />
            ))}
          </div>
        </section>

        {/* ── Kategorier: det här bygger vi ── */}
        <section className={styles.servicesSection} aria-labelledby="home-services">
          <h2 id="home-services" className={styles.sectionTitle}>Det här bygger vi</h2>
          <p className={styles.servicesLead}>
            Vi tar oss an byggprojekt i hela {CONTACT.areaServed.slice(0, -1).join(", ")} och
            resten av Skåne, från första skiss till färdigt bygge.
          </p>
          <ul className={styles.servicesList}>
            {settings.categories.map((c) => (
              <li key={c.slug}>
                <Link to={categoryPath(c.slug)} className={styles.servicesLink}>
                  <span className={styles.servicesName}>{c.name}</span>
                  {c.detail && <span className={styles.servicesDetail}> {c.detail}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/projekt" className={`${styles.sectionLink} ${styles.servicesMore}`}>Se våra projekt</Link>
        </section>

        {/* ── Omdömen (slås på i admin → Inställningar) ── */}
        {reviews && (
          <section className={styles.reviewsBand} aria-labelledby="home-reviews">
            <Star size={22} className={styles.reviewsIcon} aria-hidden />
            <div>
              <h2 id="home-reviews" className={styles.reviewsTitle}>Vad tycker våra kunder?</h2>
              <p className={styles.reviewsText}>Läs omdömen från kunder på Österlen – eller lämna ett eget efter ditt projekt.</p>
            </div>
            <a href={reviews} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
              Omdömen på Google
            </a>
          </section>
        )}

        {/* ── CTA ── */}
        <div className={styles.homeCta}>
          <p className={styles.homeCtaTitle}>Redo att sätta igång?</p>
          <p className={styles.homeCtaSubtitle}>
            Vi erbjuder kostnadsfri konsultation — berätta om ditt projekt
            så återkommer vi inom 24 timmar på vardagar.
          </p>
          <div className={styles.homeCtaButtons}>
            <Link to="/book"       className={styles.btnPrimary}>Boka konsultation</Link>
            <Link to="/snickerier" className={styles.btnGhost}>Se snickerier</Link>
          </div>
        </div>

      </div>
      </main>

      <Footer />
    </div>
  );
}