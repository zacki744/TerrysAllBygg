"use client";

import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import SnickeriForm, { SnickeriFormData } from "../../components/SnickeriForm";
import styles from "../../admin.module.css";

async function createSnickeri(data: SnickeriFormData, token: string): Promise<void> {
  const res = await fetch("/api/admin/snickerier", {
    method: "POST",
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
    throw new Error(err.message || "Kunde inte skapa snickeri");
  }
}

export default function NewSnickeri() {
  const router = useRouter();

  const handleSubmit = async (data: SnickeriFormData) => {
    const token = localStorage.getItem("admin_token") ?? "";
    await createSnickeri(data, token);
    router.push("/admin");
  };

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Skapa nytt snickeri
        </h1>
        <SnickeriForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin")}
        />
      </main>
    </div>
  );
}
