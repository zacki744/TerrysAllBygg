// src/pages/Services.tsx — /tjanster
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import { SERVICES_PATH, AREA_TEXT, servicePath } from "../lib/services";
import { paragraphs } from "../lib/settings";
import { useSettings } from "../lib/settingsContext";
import styles from "../pages.module.css";

export default function Services() {
  const { services } = useSettings();
  const names = services.map((s) => s.name.toLowerCase());
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} och ${names.at(-1)}` : names[0] ?? "byggprojekt";

  return (
    <PageShell wide>
      <PageMeta
        title="Tjänster"
        description={`Vi bygger ${list} i ${AREA_TEXT}. Kostnadsfri konsultation.`}
        canonical={SERVICES_PATH}
        breadcrumbs={[{ name: "Tjänster", path: SERVICES_PATH }]}
      />

      <header className={styles.servicesHeader}>
        <h1 className={styles.pageTitle}>Det här bygger vi</h1>
        <p className={styles.pageSubtitle}>
          Från första skiss till färdigt bygge i {AREA_TEXT}. Konsultationen är alltid kostnadsfri.
        </p>
      </header>

      <ul className={styles.serviceCards}>
        {services.map((s) => (
          <li key={s.slug}>
            <Link to={servicePath(s.slug)} className={styles.serviceCard}>
              <h2 className={styles.serviceCardTitle}>{s.name}</h2>
              <p className={styles.serviceCardText}>{paragraphs(s.intro)[0] ?? `${s.name} ${s.detail}`}</p>
              <span className={styles.serviceCardMore}>
                Läs mer <ArrowRight size={16} aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
