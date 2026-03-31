"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./components.module.css";

const links = [
  { href: "/",           label: "Hem" },
  { href: "/snickerier", label: "Snickerier" },
  { href: "/about",      label: "Om Oss" },
  { href: "/book",       label: "Boka" },
  { href: "/admin",      label: "Admin" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navBrand}>
            Terrys All Bygg
          </Link>

          {/* Desktop links */}
          <div className={styles.navLinks}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.navLink} ${pathname === l.href ? styles.navLinkActive : ""}`}
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
                href={l.href}
                className={`${styles.mobileMenuLink} ${pathname === l.href ? styles.mobileMenuLinkActive : ""}`}
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