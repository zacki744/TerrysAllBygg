import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import SnickeriForm from "../../components/Admin/SnickeriForm";
import { AdminAPI } from "../../lib/adminApi";
import type { SnickeriInput } from "../../lib/types";
import PageMeta from "../../components/PageMeta";
import styles from "../../admin.module.css";
import { notify } from "../../lib/notify";

export default function NewSnickeri() {
  const navigate = useNavigate();

  const handleSubmit = async (data: SnickeriInput) => {
    await AdminAPI.snickerier.create(data);
    notify.success(`"${data.title}" är skapat och syns på sajten`);
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