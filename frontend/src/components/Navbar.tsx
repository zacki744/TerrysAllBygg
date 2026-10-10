import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import styles from "./components.module.css";

const links = [
  { href: "/",           label: "Hem" },
  { href: "/projekt",    label: "Projekt" },
  { href: "/snickerier", label: "Snickerier" },
  { href: "/about",      label: "Om oss" },
  { href: "/book",       label: "Boka" },
];

// "/" matchar bara startsidan; övriga länkar även undersidor (/projekt/…)
const isActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.navBrand}>
            Terrys Allbygg
          </Link>

          {/* Desktop links */}
          <div className={styles.navLinks}>
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`${styles.navLink} ${isActive(l.href, location.pathname) ? styles.navLinkActive : ""}`}
                aria-current={isActive(l.href, location.pathname) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className={styles.navHamburger}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Stäng meny" : "Öppna meny"}
            aria-expanded={open}
          >
            <span className={`${styles.hamburgerBar} ${open ? styles.hamburgerBarTop : ""}`} />
            <span className={`${styles.hamburgerBar} ${open ? styles.hamburgerBarMid : ""}`} />
            <span className={`${styles.hamburgerBar} ${open ? styles.hamburgerBarBot : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.mobileMenuBackdrop} onClick={() => setOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            {links.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`${styles.mobileMenuLink} ${isActive(l.href, location.pathname) ? styles.mobileMenuLinkActive : ""}`}
                aria-current={isActive(l.href, location.pathname) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}