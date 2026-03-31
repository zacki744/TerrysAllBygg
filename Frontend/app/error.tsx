"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import styles from "./pages.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainNarrow}>
        <div style={{ textAlign: "center", padding: "5rem 0" }}>
          <h1 className={styles.pageTitle} style={{ marginBottom: "1rem" }}>
            Något gick fel
          </h1>
          <p className={styles.pageSubtitle} style={{ marginBottom: "2rem" }}>
            Ett oväntat fel uppstod. Du kan försöka igen eller gå tillbaka till startsidan.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9375rem",
              }}
            >
              Försök igen
            </button>
            <a
              href="/"
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.9375rem",
                textDecoration: "none",
              }}
            >
              Tillbaka till startsidan
            </a>
          </div>

          {error.digest && (
            <p style={{
              marginTop: "3rem",
              fontSize: "0.75rem",
              color: "color-mix(in srgb, var(--foreground) 30%, transparent)"
            }}>
              Felkod: {error.digest}
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}