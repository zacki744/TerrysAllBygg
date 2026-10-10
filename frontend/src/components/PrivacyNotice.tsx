// src/components/PrivacyNotice.tsx
// ── Informationstext + bekräftelse vid formulär som skickar personuppgifter ──
//
// Rättslig grund för formulären är "åtgärder före avtal" (GDPR art. 6.1 b),
// inte samtycke. Kryssrutan är därför en bekräftelse på att besökaren fått
// informationen (art. 13), inte ett samtycke som kan återkallas.

import { Link } from "react-router-dom";
import { PRIVACY } from "../lib/privacy";
import styles from "../pages.module.css";

interface PrivacyNoticeProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function PrivacyNotice({ id, checked, onChange }: PrivacyNoticeProps) {
  const textId = `${id}-text`;

  return (
    <div className={`${styles.privacyNotice} ${styles.formFieldFull}`}>
      <p id={textId} className={styles.privacyNoticeText}>
        Uppgifterna du anger används bara för att besvara din förfrågan och ta fram
        ett eventuellt offertförslag. De skickas till oss via e-post och sparas inte
        i någon databas på webbplatsen. Vi delar dem inte med någon för
        marknadsföring.
      </p>

      <label htmlFor={id} className={styles.privacyCheckLabel}>
        <input
          id={id}
          type="checkbox"
          className={styles.privacyCheckbox}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={textId}
          required
        />
        <span>
          Jag har läst{" "}
          <Link to={PRIVACY.path} target="_blank" rel="noopener" className={styles.privacyLink}>
            integritetspolicyn
          </Link>{" "}
          och förstår hur mina uppgifter behandlas. *
        </span>
      </label>
    </div>
  );
}
