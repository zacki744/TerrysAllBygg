"use client";

import { useRouter } from "next/navigation";
import { AuthService } from "@/app/lib/auth";
import Button from "@/app/components/ui/Button";
import styles from "../admin.module.css";
import Link from "next/link";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.push("/admin/login");
  };

  return (
    <nav className={styles.navbar}>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <span className={styles.navBrand}>Terrys All Bygg</span>
        <div className={styles.navLinks}>
          <Link href="/admin" className={styles.navLink}>Projekt</Link>
          <Link href="/" className={styles.navLink}>Visa sida</Link>
        </div>
      </div>

      <Button onClick={handleLogout} className="text-sm px-4 py-2">
        Logga ut
      </Button>
    </nav>
  );
}