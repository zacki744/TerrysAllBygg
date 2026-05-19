import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageMeta from "../components/PageMeta";
import styles from "../pages.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <PageMeta title="Sidan hittades inte" noIndex={true} />
      <Navbar />

      <main className={styles.mainNarrow}>
        <div style={{
          textAlign: "center",
          padding: "5rem 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}>
          <p style={{
            fontSize: "6rem",
            fontWeight: 800,
            color: "var(--primary)",
            lineHeight: 1,
            margin: 0,
          }}>
            404
          </p>

          <h1 className={styles.pageTitle}>Sidan hittades inte</h1>

          <p className={styles.pageSubtitle} style={{ maxWidth: "28rem" }}>
            Sidan du letar efter finns inte eller har flyttats. Gå tillbaka till
            startsidan eller välj en sida i menyn.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link to="/" style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}>
              Tillbaka till startsidan
            </Link>
            <Link to="/book" style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontWeight: 500,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}>
              Kontakta oss
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}