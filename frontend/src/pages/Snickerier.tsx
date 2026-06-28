import { useEffect, useState } from "react";
import Navbar from "./../components/Navbar";
import Footer from "./../components/Footer";
import SnickeriCard from "./../components/SnickeriCard";
import { SnickeriCardSkeleton } from "./../components/Skeletons";
import RetryError from "./../components/RetryError";
import PageMeta from "./../components/PageMeta";
import styles from "./../pages.module.css";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function Snickerier() {
  const [items, setItems]     = useState<SnickeriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch("/api/snickerier")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <PageMeta
        title="Snickerier"
        description="Handgjorda snickerier från Terrys AllBygg — stolar, bord, hyllor och mer. Färdiga att beställa i Österlen, Skåne."
        canonical="/snickerier"
      />
      <Navbar />

      <main className={styles.mainWide}>
        <header style={{ marginBottom: "2.5rem" }}>
          <h1 className={styles.pageTitle}>Snickerier</h1>
          <p className={styles.pageSubtitle}>
            Handgjorda snickerier — färdiga att beställa. Hör av dig så ordnar vi resten.
          </p>
        </header>

        <div className={styles.snickeriList}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <SnickeriCardSkeleton key={i} />
          ))}

          {!loading && error && (
            <RetryError/>
          )}

          {!loading && !error && items.length === 0 && (
            <p className={styles.stateText}>Inga snickerier tillgängliga just nu.</p>
          )}

          {!loading && !error && items.map((item, i) => (
            <SnickeriCard
              key={item.id}
              {...item}
              priority={i === 0}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}