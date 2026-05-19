import { Link } from "react-router-dom";
import Navbar from "./../components/Navbar";
import Footer from "./../components/Footer";
import PageMeta from "./../components/PageMeta";
import { CONTACT } from "./../lib/contact";
import styles from "./../pages.module.css";

export default function About() {
  return (
    <div className={styles.page}>
      <PageMeta
        title="Om Oss"
        description="Lär känna Terrys All Bygg — ett lokalt hantverksföretag i Österlen med passion för kvalitet. Vi hjälper dig från idé till färdigt projekt."
        canonical="/about"
      />
      <Navbar />

      <main className={styles.mainNarrow}>

        {/* ── Intro ── */}
        <header style={{ marginBottom: "3rem" }}>
          <h1 className={styles.pageTitle}>Om Terrys All Bygg</h1>
          <p className={styles.pageSubtitle}>
            Lokalt hantverksföretag med rötterna i Österlen och hjärtat i varje projekt.
          </p>
        </header>

        {/* ── Historia ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 className={styles.aboutTitle}>Vår historia</h2>
          <p className={styles.aboutBody}>
            Terrys All Bygg grundades av Terry med målet att erbjuda Österlens
            invånare en pålitlig hantverkare som håller vad han lovar.
            Med erfarenhet inom byggbranschen och en passion för hantverk
            har vi hjälpt många kunder förverkliga sina drömmar —
            från enkla förråd till avancerade tillbyggnader och skräddarsydda snickerier.
          </p>
          <p className={styles.aboutBody} style={{ marginTop: "1rem" }}>
            Vi är stolta över att vara ett lokalt företag som känner sin bygd och
            sina kunder. För oss är varje projekt unikt och varje kund förtjänar
            full uppmärksamhet och omsorg från start till mål.
          </p>
        </section>

        {/* ── Vad vi gör ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 className={styles.aboutTitle}>Vad vi bygger</h2>
          <p className={styles.aboutBody}>
            Vi tar oss an de flesta typer av byggprojekt — stora som små:
          </p>
          <ul style={{
            marginTop: "1rem",
            paddingLeft: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            color: "color-mix(in srgb, var(--foreground) 70%, transparent)",
            lineHeight: 1.7,
          }}>
            <li>Bastuer — utomhus och inomhus</li>
            <li>Tillbyggnader och ombyggnationer</li>
            <li>Altaner och uteplatser</li>
            <li>Förråd och garage</li>
            <li>Trädgårdsstudios och gästhus</li>
            <li>Skräddarsydda snickerier — Framförallt utomhus möbler</li>
            <li>Renoveringar</li>
          </ul>
        </section>

        {/* ── Kontakt ── */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 className={styles.aboutTitle}>Kontakta oss</h2>
          <div className={styles.infoBox} style={{ marginTop: "1.5rem" }}>
            <p className={styles.infoBoxTitle}>Kontaktuppgifter</p>
            <div className={styles.infoBoxText} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <a href={CONTACT.phoneHref} style={{ color: "inherit" }}>
                📞 {CONTACT.phone}
              </a>
              <a href={CONTACT.emailHref} style={{ color: "inherit" }}>
                ✉️ {CONTACT.email}
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", paddingBottom: "2rem" }}>
          <Link to="/book" style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            borderRadius: "9999px",
            backgroundColor: "var(--primary)",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}>
            Boka konsultation
          </Link>
          <Link to="/snickerier" style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            borderRadius: "9999px",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontWeight: 500,
            textDecoration: "none",
          }}>
            Se våra snickerier
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}