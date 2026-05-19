"use client";

import { useNavigate, useLocation  } from "react-router-dom";
import { AuthService } from "../../lib/auth";
import styles from "../../admin.module.css";
import { Link } from "react-router-dom";

export default function AdminNavbar() {
  const navigate    = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate("/admin/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname?.startsWith(path + "/")
      ? `${styles.navLink} ${styles.navLinkActive}`
      : styles.navLink;

  return (
    <nav className={styles.navbar}>
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <span className={styles.navBrand}>Terrys All Bygg</span>
        <div className={styles.navLinks}>
          <Link to="/admin"        className={isActive("/admin")}>Översikt</Link>
          <Link to="/admin/users"  className={isActive("/admin/users")}>Användare</Link>
          <Link to="/"             className={styles.navLink}>Visa sida</Link>
        </div>
      </div>

      <button onClick={handleLogout} className={styles.addButton}>
        Logga ut
      </button>
    </nav>
  );
}