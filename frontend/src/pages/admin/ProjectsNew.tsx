import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import ProjectForm from "../../components/Admin/ProjectForm";
import { AdminAPI } from "../../lib/auth";
import { type CreateProjectRequest, type UpdateProjectRequest } from "../../lib/project";
import styles from "../../admin.module.css";
import PageMeta from "../../components/PageMeta";
import { notify } from "../../lib/notify";

export default function NewProject() {
  const navigate = useNavigate();
  const [, setSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProjectRequest | UpdateProjectRequest) => {
    setSubmitting(true);
    try {
      await AdminAPI.createProject(data as CreateProjectRequest);
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
