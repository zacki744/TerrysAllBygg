import Link from "next/link";
import styles from "./components.module.css";

// Place your hero image in /public/hero.jpg (or update the path below)
const HERO_IMAGE = "/Hero.png";

export default function Hero() {
  return (
    <div className={styles.heroWrapper}>
      {/* Mobile only: full-bleed background image + dark overlay */}
      <img src={HERO_IMAGE} alt="" className={styles.heroBgImage} aria-hidden />
      <div className={styles.heroBgOverlay} aria-hidden />

      {/* Inner: text left + image right (desktop) */}
      <div className={styles.heroInner}>

        <div className={styles.heroContent}>
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Skräddarsydda byggprojekt i Österlen
            </h1>
            <p className={styles.heroLead}>
              Terrys All Bygg är ditt lokala byggföretag i Österlen, Skåne. Vi designar
              och uppför högkvalitativa byggprojekt såsom bastuer, tillbyggnader, förråd
              och andra specialanpassade lösningar.
            </p>
            <p className={styles.heroBody}>
              Med fokus på hållbarhet, funktion och detaljer hjälper vi dig från idé till
              färdigt resultat. Oavsett om det är en utomhusbastu, en trädgårdsstudio eller
              en tillbyggnad – vi förverkligar ditt projekt med kvalitet och omsorg.
            </p>

            <div className={styles.heroCtaRow}>
              <Link href="/book" className={styles.heroCtaSecondary}>
                Boka en konsultation →
              </Link>
              <Link href="/snickerier" className={styles.heroCtaSecondary}>
                Se våra snickerier →
              </Link>
            </div>
          </section>
        </div>

        {/* Desktop only: image column */}
        <div className={styles.heroImageCol}>
          <img src={HERO_IMAGE} alt="Terrys All Bygg" className={styles.heroSideImage} />
        </div>

      </div>
    </div>
  );
}