// src/components/CallBar.tsx
// ── Fast åtgärdsrad längst ner på mobil: ring eller boka ──
// Hantverkskunder ringer ofta hellre än fyller i formulär.
// Renderas från Footer, så den finns på alla publika sidor men inte i admin.

import { Link, useLocation } from "react-router-dom";
import { Phone } from "lucide-react";
import { CONTACT } from "../lib/contact";
import styles from "./components.module.css";

export default function CallBar() {
  const { pathname } = useLocation();
  const onBookPage = pathname === "/book";

  return (
    <div className={styles.callBar}>
      <a href={CONTACT.phoneHref} className={styles.callBarPhone} aria-label={`Ring ${CONTACT.phone}`}>
        <Phone size={18} aria-hidden />
        Ring oss
      </a>
      {!onBookPage && (
        <Link to="/book" className={styles.callBarBook}>
          Boka konsultation
        </Link>
      )}
    </div>
  );
}
