// src/pages/Service.tsx — /tjanster/:slug
import { Link, useParams } from "react-router-dom";
import { Check, Info, Phone } from "lucide-react";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import ProjectCard from "../components/project/ProjectCard";
import NotFound from "./NotFound";
import { useFetch } from "../hooks/useFetch";
import { API, type ProjectOverview } from "../lib/api";
import { CONTACT } from "../lib/contact";
import {
  SERVICES, SERVICES_PATH, PROCESS, AREA_TEXT,
  findService, projectsForService, servicePath,
} from "../lib/services";
import styles from "../pages.module.css";

export default function Service() {
  const { slug } = useParams();
  const service = findService(slug);
  // Hämtas i webbläsaren (förrenderingen visar sidan utan projekt)
  const { data: projects } = useFetch<ProjectOverview[]>(service ? API.projects : null);

  if (!service) return <NotFound />;

  const examples = projectsForService(service, projects ?? []).slice(0, 3);
  const others = SERVICES.filter((s) => s.slug !== service.slug);
  const path = servicePath(service.slug);

  return (
    <PageShell wide>
      <PageMeta
        title={service.title}
        description={service.description}
        canonical={path}
        breadcrumbs={[
          { name: "Tjänster", path: SERVICES_PATH },
          { name: service.name, path },
        ]}
        service={service}
      />

      <nav aria-label="Brödsmulor" className={styles.breadcrumbs}>
        <Link to={SERVICES_PATH}>Tjänster</Link> <span aria-hidden>/</span> <span aria-current="page">{service.name}</span>
      </nav>

      <div className={styles.serviceLayout}>
        <article className={styles.serviceMain}>
          <h1 className={styles.pageTitle}>{service.title}</h1>
          {service.intro.map((p) => <p key={p} className={styles.serviceLead}>{p}</p>)}

          <section aria-labelledby="includes">
            <h2 id="includes" className={styles.serviceH2}>Det här kan vi hjälpa till med</h2>
            <ul className={styles.checkList}>
              {service.includes.map((item) => (
                <li key={item}><Check size={18} aria-hidden className={styles.checkIcon} /> {item}</li>
              ))}
            </ul>
          </section>

          <aside className={styles.goodToKnow} aria-labelledby="good-to-know">
            <h2 id="good-to-know" className={styles.goodToKnowTitle}>
              <Info size={18} aria-hidden /> Bra att veta
            </h2>
            <p>{service.goodToKnow}</p>
          </aside>

          <section aria-labelledby="process">
            <h2 id="process" className={styles.serviceH2}>Så går det till</h2>
            <ol className={styles.processList}>
              {PROCESS.map((step) => (
                <li key={step.title}>
                  <h3 className={styles.processTitle}>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </article>

        {/* Kontaktruta — ligger kvar i bild på dator */}
        <aside className={styles.serviceAside} aria-labelledby="service-cta">
          <div className={styles.projectCta}>
            <h2 id="service-cta" className={styles.projectCtaTitle}>Funderar du på {service.name.toLowerCase()}?</h2>
            <p className={styles.projectCtaText}>
              Berätta vad du vill bygga så återkommer vi inom 24 timmar på vardagar. Vi arbetar i {AREA_TEXT}.
            </p>
            <div className={styles.projectCtaButtons}>
              <Link to={`/book?typ=${service.bookType}`} className={styles.btnPrimary}>Boka kostnadsfri konsultation</Link>
              <a href={CONTACT.phoneHref} className={`${styles.btnGhost} ${styles.iconLine}`}>
                <Phone size={16} aria-hidden /> {CONTACT.phone}
              </a>
            </div>
            {service.slug === "snickerier" && (
              <Link to="/snickerier" className={styles.sectionLink}>Se färdiga snickerier</Link>
            )}
          </div>
        </aside>
      </div>

      {examples.length > 0 && (
        <section className={styles.moreProjects} aria-labelledby="examples">
          <div className={styles.sectionHeader}>
            <h2 id="examples" className={styles.sectionTitle}>Exempel från våra projekt</h2>
            <Link to="/projekt" className={styles.sectionLink}>Alla projekt</Link>
          </div>
          <div className={styles.projectGrid}>
            {examples.map((p) => <ProjectCard key={p.id} {...p} />)}
          </div>
        </section>
      )}

      <section className={styles.moreProjects} aria-labelledby="other-services">
        <h2 id="other-services" className={styles.sectionTitle}>Andra tjänster</h2>
        <ul className={styles.serviceChips}>
          {others.map((s) => (
            <li key={s.slug}><Link to={servicePath(s.slug)} className={styles.serviceChip}>{s.name}</Link></li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
