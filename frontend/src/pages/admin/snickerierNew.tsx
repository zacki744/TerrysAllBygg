import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import SnickeriForm, { type SnickeriFormData } from "../../components/Admin/SnickeriForm";
import PageMeta from "../../components/PageMeta";
import styles from "../../admin.module.css";

async function createSnickeri(data: SnickeriFormData): Promise<void> {
  const res = await fetch("/api/admin/snickerier", {
    method:      "POST",
    credentials: "include",
    headers:     { "Content-Type": "application/json" },
    body: JSON.stringify({
      title:            data.title,
      description:      data.description,
      price:            data.price,
      mainImage:        data.mainImage,
      additionalImages: data.additionalImages ?? [],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Kunde inte skapa snickeri");
  }
}

export default function NewSnickeri() {
  const navigate = useNavigate();

  const handleSubmit = async (data: SnickeriFormData) => {
    await createSnickeri(data);
    navigate("/admin");
  };

  return (
    <div className={styles.page}>
      <PageMeta title="Nytt snickeri" noIndex={true} />
      <AdminNavbar />
      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Skapa nytt snickeri
        </h1>
        <SnickeriForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
        />
      </main>
    </div>
  );
}