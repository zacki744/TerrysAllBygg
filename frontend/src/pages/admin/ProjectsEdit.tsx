import { useEffect, useState } from "react";
import { useSearchParams, useNavigate  } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import ProjectForm from "../../components/Admin/ProjectForm";
import { AdminAPI } from "../../lib/adminApi";
import type { ProjectDetail, ProjectInput } from "../../lib/types";
import styles from "../../admin.module.css";
import { notify } from "../../lib/notify";

export default function EditProjectContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      notify.error("Inget projekt valt");
      navigate("/admin");
      return;
    }

    const loadProject = async () => {
      try {
        setProject(await AdminAPI.projects.get(id));
      } catch {
        notify.error("Projektet hittades inte. Det kan ha raderats.");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, navigate]);

  const handleSubmit = async (data: ProjectInput) => {
    if (!id) return;
    await AdminAPI.projects.update(id, data);
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
  if (!project) {
    return (
      <div className={styles.page}>
        <AdminNavbar />
        <main className={styles.main}>
          <p className={styles.loadingText}>Projektet kunde inte hämtas.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Redigera projekt
        </h1>
        <ProjectForm
          initialData={project}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
          isEdit
        />
      </main>
    </div>
  );
}
