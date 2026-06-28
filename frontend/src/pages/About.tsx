import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import { CONTACT } from "../lib/contact";
import styles from "../pages.module.css";

const SERVICES = [
  "Bastuer — utomhus och inomhus",
  "Tillbyggnader och ombyggnationer",
  "Altaner och uteplatser",
  "Förråd och garage",
  "Trädgårdsstudios och gästhus",
  "Skräddarsydda snickerier — framförallt utomhusmöbler",
  "Renoveringar",
];

export default function About() {
  return (
    <PageShell>
      <PageMeta
        title="Om Oss"
        description="Lär känna Terrys Allbygg — ett lokalt hantverksföretag i Österlen med passion för kvalitet."
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
          {SERVICES.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <section>
        <h2 className={styles.aboutTitle}>Kontakta oss</h2>
        <div className={styles.infoBox} style={{ marginTop: "1.5rem" }}>
          <p className={styles.infoBoxTitle}>Kontaktuppgifter</p>
          <div className={styles.infoBoxText} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <a href={CONTACT.phoneHref} style={{ color: "inherit" }}>📞 {CONTACT.phone}</a>
            <a href={CONTACT.emailHref} style={{ color: "inherit" }}>✉️ {CONTACT.email}</a>
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