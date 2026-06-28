import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageMeta from "../components/PageMeta";
import styles from "../pages.module.css";

export default function NotFound() {
  return (
    <PageShell>
      <PageMeta title="Sidan hittades inte" noIndex />
      <div className={styles.notFound}>
        <p className={styles.notFoundCode}>404</p>
        <h1 className={styles.pageTitle}>Sidan hittades inte</h1>
        <p className={styles.pageSubtitle}>
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <div className={styles.notFoundActions}>
          <Link to="/" className={styles.btnPrimary}>Tillbaka till startsidan</Link>
          <Link to="/book" className={styles.btnGhost}>Kontakta oss</Link>
        </div>
      </div>
    </PageShell>
  );
}