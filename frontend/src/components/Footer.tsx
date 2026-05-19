import { Link } from "react-router-dom";
import { CONTACT } from "../lib/contact";
import styles from "./components.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>

        {/* ── Kolumn 1: Varumärke + beskrivning ── */}
        <div>
          <p className={styles.footerBrand}>{CONTACT.companyName}</p>
          <p className={styles.footerText}>
            Lokalt byggföretag i Österlen, Skåne. Vi förverkligar ditt projekt
            med kvalitet och omsorg.
          </p>

          {/* Sociala medier om de finns */}
          {(CONTACT.social.facebook || CONTACT.social.instagram) && (
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              {CONTACT.social.facebook && (
                <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer"
                  className={styles.footerLink}>
                  Facebook
                </a>
              )}
              {CONTACT.social.instagram && (
                <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer"
                  className={styles.footerLink}>
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── Kolumn 2: Navigering ── */}
        <div>
          <p className={styles.footerHeading}>Navigering</p>
          <nav className={styles.footerNav}>
            <Link to="/"           className={styles.footerLink}>Hem</Link>
            <Link to="/snickerier" className={styles.footerLink}>Snickerier</Link>
            <Link to="/about"      className={styles.footerLink}>Om Oss</Link>
            <Link to="/book"       className={styles.footerLink}>Boka konsultation</Link>
          </nav>
        </div>

        {/* ── Kolumn 3: Kontakt ── */}
        <div>
          <p className={styles.footerHeading}>Kontakt</p>
          <div className={styles.footerNav}>
            <a href={CONTACT.phoneHref} className={styles.footerLink}>
              📞 {CONTACT.phone}
            </a>
            <a href={CONTACT.emailHref} className={styles.footerLink}>
              ✉️ {CONTACT.email}
            </a>
          </div>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>
          © {year} {CONTACT.companyName}. Alla rättigheter förbehållna.
        </p>
      </div>
    </footer>
  );
}