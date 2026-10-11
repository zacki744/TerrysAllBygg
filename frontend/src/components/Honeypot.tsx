// src/components/Honeypot.tsx
// ── Dolt fält som fångar spambotar ──
// Människor ser det aldrig (det ligger utanför skärmen och går inte att tabba
// till). Botar fyller i alla fält, och servern kastar då förfrågan tyst.
// Fältet skickas som "website" i JSON-kroppen.

import styles from "./components.module.css";

interface HoneypotProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label>
        Lämna detta fält tomt
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
