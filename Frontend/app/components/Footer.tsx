import Link from "next/link";
import styles from "./components.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>

        {/* Company Info */}
        <div>
          <p className={styles.footerBrand}>Terrys All Bygg</p>
          <p className={styles.footerText}>Lokalt byggföretag i Österlen, Skåne</p>
          <p className={styles.footerText} style={{ marginTop: "1rem" }}>
            Professionell service för skräddarsydda byggprojekt
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <p className={styles.footerHeading}>Snabblänkar</p>
          <nav className={styles.footerNav}>
            <Link href="/" className={styles.footerLink}>Hem</Link>
            <Link href="/about" className={styles.footerLink}>Om Oss</Link>
            <Link href="/book" className={styles.footerLink}>Boka Konsultation</Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <p className={styles.footerHeading}>Kontakt</p>
          <div className={styles.footerNav}>
            <p className={styles.footerText}>📍 Österlen, Skåne</p>
            <p className={styles.footerText}>
              📧{" "}
              <Link href="/book" className={styles.footerLink}>
                Boka via mejl
              </Link>
            </p>
          </div>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p className={styles.footerCopy}>
          © {new Date().getFullYear()} Terrys All Bygg. Alla rättigheter förbehållna.
        </p>
      </div>
    </footer>
  );
}