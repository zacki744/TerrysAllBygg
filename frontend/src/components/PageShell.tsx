// src/components/PageShell.tsx
// ── Wrapper som eliminerar repetitiv <div className={styles.page}> + <Navbar> + <Footer> ──

import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "../pages.module.css";

interface PageShellProps {
  children: React.ReactNode;
  wide?: boolean;   // mainWide vs mainNarrow
  stack?: boolean;  // flex-col + gap-8 på main (för detail-sidor)
}

export default function PageShell({ children, wide = false, stack = false }: PageShellProps) {
  const mainClass = wide ? styles.mainWide : styles.mainNarrow;

  return (
    <div className={styles.page}>
      <Navbar />
      <main
        className={mainClass}
        style={stack ? { display: "flex", flexDirection: "column", gap: "2rem" } : undefined}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}