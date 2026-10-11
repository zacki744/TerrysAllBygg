import { Link } from "react-router-dom";
import styles from "./components.module.css";
import defaultHeroImage from "../assets/hero.webp";
import { useSettings } from "../lib/settingsContext";
import { heroSmallUrl } from "../lib/settings";

// Fokuspunkt för uppladdade bilder (standardbilden har egen inställning i CSS)
const FOCUS = { left: "25% 50%", center: "50% 50%", right: "75% 50%" } as const;

export default function Hero() {
  const s = useSettings();
  const custom = s.heroImage;

  return (
    <div className={styles.heroWrapper}>
      <div className={styles.heroInner}>
        <div className={styles.heroMedia}>
          {custom ? (
            <img
              src={custom}
              srcSet={`${heroSmallUrl(custom)} 960w, ${custom} 1920w`}
              sizes="(max-width: 1280px) 100vw, 1280px"
              alt={s.heroImageAlt}
              className={styles.heroBgImage}
              style={{ objectPosition: FOCUS[s.heroImageFocus] ?? FOCUS.center }}
              fetchPriority="high"
              width={s.heroImageWidth ?? 1920}
              height={s.heroImageHeight ?? 1080}
              decoding="async"
            />
          ) : (
            <img
              src={defaultHeroImage}
              alt={s.heroImageAlt}
              className={styles.heroBgImage}
              fetchPriority="high"
              width={1080}
              height={731}
              decoding="async"
            />
          )}
        </div>
        <div className={styles.heroBgOverlay} aria-hidden />

        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Österlen · Skåne</span>

          <h1 className={styles.heroTitle}>{s.heroTitle}</h1>

          <p className={styles.heroLead}>{s.heroLead}</p>

          <div className={styles.heroCtaRow}>
            <Link to="/book" className={styles.heroCtaPrimary}>
              Boka konsultation
            </Link>
            <Link to="/snickerier" className={styles.heroCtaSecondary}>
              Se våra snickerier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
