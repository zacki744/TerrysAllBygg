import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import SnickeriForm from "../../components/Admin/SnickeriForm";
import { AdminAPI } from "../../lib/adminApi";
import type { SnickeriDetail, SnickeriInput } from "../../lib/types";
import PageMeta from "../../components/PageMeta";
import styles from "../../admin.module.css";
import { notify } from "../../lib/notify";

export default function EditSnickeri() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [snickeri, setSnickeri] = useState<SnickeriDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/admin");
      return;
    }
    AdminAPI.snickerier.get(id)
      .then(setSnickeri)
      .catch(() => {
        notify.error("Snickeriet hittades inte. Det kan ha raderats.");
        navigate("/admin");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data: SnickeriInput) => {
    if (!id) return;
    await AdminAPI.snickerier.update(id, data);
    notify.success(`"${data.title}" är sparat`);
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Laddar…</p>
      </div>
    );
  }

  // Hämtningen misslyckades — notisen visas och vi skickas tillbaka till översikten
  if (!snickeri) {
    return (
      <div className={styles.page}>
        <AdminNavbar />
        <main className={styles.main}>
          <p className={styles.loadingText}>Snickeriet kunde inte hämtas.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageMeta title="Redigera snickeri" noIndex={true} />
      <AdminNavbar />
      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Redigera snickeri
        </h1>
        <SnickeriForm
          initialData={{
            title:            snickeri.title,
            description:      snickeri.description,
            price:            snickeri.price,
            mainImage:        snickeri.images[0],
            additionalImages: snickeri.images.slice(1),
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
          isEdit
        />
      </main>
    </div>
  );
}