"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import SnickeriCard from "@/app/components/SnickeriCard";
import styles from "../pages.module.css";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export default function SnickeriPage() {
  const [items, setItems] = useState<SnickeriItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/snickerier")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainWide}>
        <header style={{ marginBottom: "2.5rem" }}>
          <h1 className={styles.pageTitle}>Snickerier</h1>
          <p className={styles.pageSubtitle}>
            Handgjorda snickerier — färdiga att beställa. Hör av dig så ordnar vi resten.
          </p>
        </header>

        {loading && <p className={styles.stateText}>Laddar snickerier…</p>}

        {!loading && items.length === 0 && (
          <p className={styles.stateText}>Inga snickerier tillgängliga just nu.</p>
        )}

        {!loading && items.length > 0 && (
          <div className={styles.snickeriList}>
            {items.map((item) => (
              <SnickeriCard
                key={item.id}
                id={item.id}
                title={item.title}
                description={item.description}
                price={item.price}
                image={item.image}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}