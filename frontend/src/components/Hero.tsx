import { Link } from "react-router-dom";
import styles from "./components.module.css";
import heroImage from "../assets/hero.webp";

export default function Hero() {
  return (
    <div className={styles.heroWrapper}>
      <div className={styles.heroInner}>
        <div className={styles.heroMedia}>
          <img
            src={heroImage}
            alt="Terrys Allbygg — byggprojekt i Österlen"
            className={styles.heroBgImage}
            fetchPriority="high"
          />
        </div>
        <div className={styles.heroBgOverlay} aria-hidden />

        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Österlen · Skåne</span>

          <h1 className={styles.heroTitle}>
            Byggprojekt med omsorg och hantverk
          </h1>

          <p className={styles.heroLead}>
            Terrys Allbygg är ditt lokala bygg- och snickeriföretag på
            Österlen, Skåne. Vi designar och uppför byggprojekt tillsammans
            med kunden såsom bastuer, tillbyggnader, förråd och andra
            specialanpassade lösningar.
          </p>

          <div className={styles.heroCtaRow}>
            <Link to="/book" className={styles.heroCtaPrimary}>
              Boka konsultation
            </Link>
            <Link to="/snickerier" className={styles.heroCtaSecondary}>
              Se snickerier →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}