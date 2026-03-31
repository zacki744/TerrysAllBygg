import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import styles from "./pages.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainNarrow}>
        <div style={{ textAlign: "center", padding: "5rem 0" }}>
          <p style={{
            fontSize: "5rem",
            fontWeight: 800,
            color: "var(--primary)",
            lineHeight: 1,
            marginBottom: "1rem"
          }}>
            404
          </p>
          <h1 className={styles.pageTitle} style={{ marginBottom: "1rem" }}>
            Sidan hittades inte
          </h1>
          <p className={styles.pageSubtitle} style={{ marginBottom: "2.5rem" }}>
            Sidan du letar efter finns inte eller har flyttats.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}