import { Link } from "react-router-dom";
import styles from "./components.module.css";
import heroImage from "../assets/hero.webp";

export default function Hero() {
  return (
    <div className={styles.heroWrapper}>
      <img src={heroImage} alt="" className={styles.heroBgImage} aria-hidden fetchPriority="high" />
      <div className={styles.heroBgOverlay} aria-hidden />

      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <section className={styles.hero}>
            <p className={styles.heroLead}>Österlen · Skåne</p>

            <h1 className={styles.heroTitle}>
              Byggprojekt med{" "}
              <em className={styles.heroTitleAccent}>omsorg</em>{" "}
              och hantverk
            </h1>

            <p className={styles.heroLead}>
              Terrys All Bygg är ditt lokala bygg och snickeri företag på Österlen, Skåne. Vi designar och uppför byggprojekt tillsammans med kunden såsom bastuer, tillbyggnader, förråd och andra specialanpassade lösningar.
            </p>

            <div className={styles.heroCtaRow}>
              <Link to="/book"       className={styles.heroCtaSecondary}>Boka konsultation</Link>
              <Link to="/snickerier" className={styles.heroCtaSecondary}>Se snickerier →</Link>
            </div>
          </section>
        </div>

        <div className={styles.heroImageCol}>
          <img src={heroImage} alt="Terrys Allbygg — byggprojekt i Österlen"
            className={styles.heroSideImage} fetchPriority="high" />
        </div>
      </div>
    </div>
  );
}