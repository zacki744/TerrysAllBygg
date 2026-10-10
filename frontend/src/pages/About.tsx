import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import { CONTACT } from "../lib/contact";
import { SERVICES } from "../lib/services";
import styles from "../pages.module.css";


export default function About() {
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
        <p className={styles.aboutBody}>
          Terrys Allbygg grundades av Terry med målet att erbjuda Österlens invånare en pålitlig
          hantverkare som håller vad han lovar. Med erfarenhet inom byggbranschen och en passion
          för hantverk har vi hjälpt många kunder förverkliga sina drömmar — från enkla förråd till
          avancerade tillbyggnader och skräddarsydda snickerier.
        </p>
        <p className={styles.aboutBody} style={{ marginTop: "1rem" }}>
          Vi är stolta över att vara ett lokalt företag som känner sin bygd och sina kunder.
          För oss är varje projekt unikt och varje kund förtjänar full uppmärksamhet från start till mål.
        </p>
      </section>

      <section>
        <h2 className={styles.aboutTitle}>Vad vi bygger</h2>
        <p className={styles.aboutBody}>Vi tar oss an de flesta typer av byggprojekt — stora som små:</p>
        <ul className={styles.aboutList}>
          {SERVICES.map((s) => <li key={s.name}>{s.name}{s.detail && ` — ${s.detail}`}</li>)}
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