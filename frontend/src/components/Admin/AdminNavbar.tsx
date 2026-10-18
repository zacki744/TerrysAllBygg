import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../lib/auth";
import styles from "../../admin.module.css";
import { Link } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate("/admin/login");
  };

  // "/admin" (Översikt) är aktiv bara på exakt den sidan, inte på alla /admin/…
  const isActive = (path: string) =>
    location.pathname === path || (path !== "/admin" && location.pathname?.startsWith(path + "/"))
      ? `${styles.navLink} ${styles.navLinkActive}`
      : styles.navLink;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        <Link to="/admin"       className={isActive("/admin")}>Översikt</Link>
        <Link to="/admin/installningar" className={isActive("/admin/installningar")}>Inställningar</Link>
        <Link to="/admin/users" className={isActive("/admin/users")}>Användare</Link>
        <Link to="/"            className={styles.navLink}>Visa sida</Link>
      </div>

      <button onClick={handleLogout} className={styles.addButton}>
        Logga ut
      </button>
    </nav>
  );
}