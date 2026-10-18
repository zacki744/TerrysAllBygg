import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import ProjectForm from "../../components/Admin/ProjectForm";
import { AdminAPI } from "../../lib/adminApi";
import type { ProjectInput } from "../../lib/types";
import styles from "../../admin.module.css";
import PageMeta from "../../components/PageMeta";
import { notify } from "../../lib/notify";

export default function NewProject() {
  const navigate = useNavigate();
  const [, setSubmitting] = useState(false);

  const handleSubmit = async (data: ProjectInput) => {
    setSubmitting(true);
    try {
      await AdminAPI.projects.create(data);
      notify.success(`"${data.title}" är skapat och syns på sajten`);
      navigate("/admin");
    } catch (error) {
      setSubmitting(false);
      throw error;
    }
  };

  return (
    <div className={styles.page}>
      <PageMeta title="Nytt projekt" noIndex={true} />
      <AdminNavbar />
      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Skapa nytt projekt
        </h1>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
          isEdit={false}
        />
      </main>
    </div>
  );
}
