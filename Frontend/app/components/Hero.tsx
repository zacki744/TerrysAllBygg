import Link from "next/link";
import Button from "@/app/components/ui/Button";
import styles from "./components.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.heroTitle}>
        Skräddarsydda byggprojekt i Österlen
      </h1>
      <p className={styles.heroLead}>
        Terrys All Bygg är ditt lokala byggföretag i Österlen, Skåne. Vi designar
        och uppför högkvalitativa byggprojekt såsom bastuer, tillbyggnader, förråd
        och andra specialanpassade lösningar.
      </p>
      <p className={styles.heroBody}>
        Med fokus på hållbarhet, funktion och detaljer hjälper vi dig från idé till
        färdigt resultat. Oavsett om det är en utomhusbastu, en trädgårdsstudio eller
        en tillbyggnad – vi förverkligar ditt projekt med kvalitet och omsorg.
      </p>

      <div className={styles.heroCtaRow}>
        <Link href="/book" className={styles.heroCtaSecondary}>
          Boka en konsultation →
        </Link>
        <Link href="/snickerier" className={styles.heroCtaSecondary}>
          Se våra snickerier →
        </Link>
      </div>
    </section>
  );
}
