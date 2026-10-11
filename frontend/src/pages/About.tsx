import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import { CONTACT } from "../lib/contact";
import { servicePath } from "../lib/services";
import styles from "../pages.module.css";
import { useSettings } from "../lib/settingsContext";
import { paragraphs } from "../lib/settings";


export default function About() {
  const settings = useSettings();

  return (
    <PageShell>
      <PageMeta
        title="Om oss"
        description="Terrys Allbygg är ett lokalt hantverksföretag på Österlen som bygger bastuer, tillbyggnader och snickerier. Läs om oss och hur vi arbetar tillsammans med kunden."
        canonical="/about"
      />

      <header className={styles.aboutHeader}>
        <h1 className={styles.pageTitle}>Om Terrys Allbygg</h1>
        <p className={styles.pageSubtitle}>
          Lokalt hantverksföretag med rötterna i Österlen och hjärtat i varje projekt.
        </p>
      </header>

      <section>
        <h2 className={styles.aboutTitle}>Vår historia</h2>
        {paragraphs(settings.aboutStory).map((p, i) => (
          <p key={i} className={styles.aboutBody} style={i > 0 ? { marginTop: "1rem" } : undefined}>{p}</p>
        ))}
      </section>

      <section>
        <h2 className={styles.aboutTitle}>Vad vi bygger</h2>
        <p className={styles.aboutBody}>Vi tar oss an de flesta typer av byggprojekt — stora som små:</p>
        <ul className={styles.aboutList}>
          {settings.services.map((s) => (
            <li key={s.slug}><Link to={servicePath(s.slug)}>{s.name}</Link>{s.detail && ` – ${s.detail}`}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className={styles.aboutTitle}>Kontakta oss</h2>
        <div className={styles.infoBox} style={{ marginTop: "1.5rem" }}>
          <p className={styles.infoBoxTitle}>Kontaktuppgifter</p>
          <div className={styles.infoBoxText} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <a href={CONTACT.phoneHref} className={styles.iconLine}><Phone size={16} aria-hidden /> {CONTACT.phone}</a>
            <a href={CONTACT.emailHref} className={styles.iconLine}><Mail size={16} aria-hidden /> {CONTACT.email}</a>
          </div>
        </div>
      </section>

      <div className={styles.aboutCta}>
        <Link to="/book" className={styles.btnPrimary}>Boka konsultation</Link>
        <Link to="/snickerier" className={styles.btnGhost}>Se våra snickerier</Link>
      </div>
    </PageShell>
  );
}