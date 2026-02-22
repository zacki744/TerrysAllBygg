"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import SnickeriForm, { SnickeriFormData } from "../../components/SnickeriForm";
import styles from "../../admin.module.css";

interface DetailedSnickeri {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
}

async function fetchSnickeri(id: string, token: string): Promise<DetailedSnickeri> {
  const res = await fetch(`/api/admin/snickerier/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

async function updateSnickeri(
  id: string,
  data: SnickeriFormData,
  token: string
): Promise<void> {
  const res = await fetch(`/api/admin/snickerier/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      price: data.price,
      mainImage: data.mainImage,
      additionalImages: data.additionalImages ?? [],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Kunde inte uppdatera snickeri");
  }
}

export default function EditSnickeriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [snickeri, setSnickeri] = useState<DetailedSnickeri | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      alert("Inget ID angivet");
      router.push("/admin/snickerier");
      return;
    }
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      const data = await fetchSnickeri(id, token);
      setSnickeri(data);
    } catch {
      alert("Snickeri hittades inte");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: SnickeriFormData) => {
    if (!id) return;
    const token = localStorage.getItem("admin_token") ?? "";
    await updateSnickeri(id, data, token);
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Laddar...</p>
      </div>
    );
  }

  if (!snickeri) return null;

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Redigera snickeri
        </h1>
        <SnickeriForm
          initialData={{
            title: snickeri.title,
            description: snickeri.description,
            price: snickeri.price,
            mainImage: snickeri.images[0],
            additionalImages: snickeri.images.slice(1),
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin")}
          isEdit
        />
      </main>
    </div>
  );
}
