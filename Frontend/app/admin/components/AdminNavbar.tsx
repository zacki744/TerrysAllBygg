"use client";

import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "@/app/lib/auth";
import styles from "../admin.module.css";
import Link from "next/link";

export default function AdminNavbar() {
  const router  = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await AuthService.logout();   // clears httpOnly cookie via backend
    router.push("/admin/login");
  };

  const isActive = (path: string) =>
    pathname?.startsWith(path)
      ? `${styles.navLink} ${styles.navLinkActive}`
      : styles.navLink;

  return (
    <nav className={styles.navbar}>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <span className={styles.navBrand}>Terrys All Bygg</span>
        <div className={styles.navLinks}>
          <Link href="/admin" className={isActive("/admin")}>Projekt</Link>
          <Link href="/" className={styles.navLink}>Visa sida</Link>
        </div>
      </div>

      <button onClick={handleLogout} className={styles.addButton}>
        Logga ut
      </button>
    </nav>
  );
}