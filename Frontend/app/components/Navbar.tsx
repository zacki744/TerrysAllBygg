import Link from "next/link";
import styles from "./components.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.navBrand}>
          Terrys All Bygg
        </Link>

        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Hem</Link>
          <Link href="/about" className={styles.navLink}>Om Oss</Link>
          <Link href="/book" className={styles.navLink}>Boka</Link>
          <Link href="/admin/login" className={styles.navLink}>Admin</Link>
        </div>
      </div>
    </nav>
  );
}
