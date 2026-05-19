import { Link } from "react-router-dom";
import styles from "./components.module.css";
import heroImage from "../assets/hero.png";

export default function Hero() {
  return (
    <div className={styles.heroWrapper}>
      {/* Mobile only: full-bleed background image + dark overlay */}
      <img src={heroImage} alt="" className={styles.heroBgImage} aria-hidden />
      <div className={styles.heroBgOverlay} aria-hidden />

      {/* Inner: text left + image right (desktop) */}
      <div className={styles.heroInner}>

        <div className={styles.heroContent}>
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Skräddarsydda byggprojekt i Österlen
            </h1>
            <p className={styles.heroLead}>
              Terrys All Bygg är ditt lokala bygg och snickeri företag i Österlen, Skåne. Vi designar
              och uppför byggprojekt tillsammans med kunden såsom bastuer, tillbyggnader, förråd
              och andra specialanpassade lösningar.
            </p>
            <p className={styles.heroBody}>
              Med fokus på hållbarhet, funktion och detaljer hjälper vi dig från idé till
              färdigt resultat. Oavsett om det är en utomhusbastu, en trädgårdsstudio eller
              en tillbyggnad – vi förverkligar ditt projekt med kvalitet och omsorg.
            </p>

            <div className={styles.heroCtaRow}>
              <Link to="/book" className={styles.heroCtaSecondary}>
                Boka en konsultation →
              </Link>
              <Link to="/snickerier" className={styles.heroCtaSecondary}>
                Se våra snickerier →
              </Link>
            </div>
          </section>
        </div>

        {/* Desktop only: image column */}
        <div className={styles.heroImageCol}>
          <img src={heroImage} alt="Terrys All Bygg" className={styles.heroSideImage} />
        </div>

      </div>
    </div>
  );
}