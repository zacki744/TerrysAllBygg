// src/components/RetryError.tsx
// ── Visas i ett rutnät när innehåll inte kunde hämtas från API:t ──

import { CONTACT } from "../lib/contact";
import styles from "../pages.module.css";

interface RetryErrorProps {
  message?: string;
  onRetry?: () => void;   // utan onRetry laddas sidan om
}

export default function RetryError({
  message = "Det gick inte att hämta innehållet just nu.",
  onRetry,
}: RetryErrorProps) {
  return (
    <div className={styles.retryError} role="alert">
      <p className={styles.retryErrorText}>{message}</p>
      <div className={styles.retryErrorActions}>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={onRetry ?? (() => window.location.reload())}
        >
          Försök igen
        </button>
        <a href={CONTACT.phoneHref} className={styles.retryErrorPhone}>
          eller ring {CONTACT.phone}
        </a>
      </div>
    </div>
  );
}
