"use client";

import styles from "./pages.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sv">
      <body>
        <div className={styles.pageCenter}>
          <div style={{ textAlign: "center", maxWidth: "28rem", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
              Något gick fel
            </h1>
            <p style={{ color: "rgba(0,0,0,0.55)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              Ett oväntat fel uppstod. Försök igen eller återgå till startsidan.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.65rem 1.5rem",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Försök igen
              </button>
              <a
                href="/"
                style={{
                  padding: "0.65rem 1.5rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  color: "rgba(0,0,0,0.7)",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                Tillbaka till startsidan
              </a>
            </div>
            {error.digest && (
              <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "rgba(0,0,0,0.3)" }}>
                Felkod: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}