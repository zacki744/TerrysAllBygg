import styles from "./components.module.css";

// ── ProjectCard Skeleton ───────────────────────────────────

export function ProjectCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonCardImage} />
      <div className={styles.skeletonCardBody}>
        <div className={styles.skeletonCardTitle} />
        <div className={styles.skeletonCardLine} />
        <div className={styles.skeletonCardLine} />
        <div className={styles.skeletonCardLineShort} />
      </div>
    </div>
  );
}

// ── SnickeriCard Skeleton ──────────────────────────────────

export function SnickeriCardSkeleton() {
  return (
    <div className={styles.skeletonSnickeriCard}>
      <div className={styles.skeletonSnickeriImage} />
      <div className={styles.skeletonSnickeriBody}>
        <div>
          <div className={styles.skeletonSnickeriTitle} />
          <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div className={styles.skeletonSnickeriDesc} />
            <div className={styles.skeletonSnickeriDesc} />
            <div className={styles.skeletonSnickeriDescShort} />
          </div>
        </div>
        <div className={styles.skeletonSnickeriPrice} />
      </div>
    </div>
  );
}