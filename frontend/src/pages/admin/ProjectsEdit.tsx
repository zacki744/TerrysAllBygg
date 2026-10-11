import { useEffect, useState } from "react";
import { useSearchParams, useNavigate  } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import ProjectForm from "../../components/Admin/ProjectForm";
import { AdminAPI } from "../../lib/auth";
import { type UpdateProjectRequest, type DetailedProject } from "../../lib/project";
import styles from "../../admin.module.css";
import { notify } from "../../lib/notify";

export default function EditProjectContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<DetailedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      notify.error("Inget projekt valt");
      navigate("/admin");
      return;
    }

    const loadProject = async () => {
      try {
        setProject(await AdminAPI.getProject(id));
      } catch {
        notify.error("Projektet hittades inte. Det kan ha raderats.");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, navigate]);

  const handleSubmit = async (data: UpdateProjectRequest) => {
    if (!id) return;
    await AdminAPI.updateProject(id, data);
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
          initialData={{
            title: project.title,
            description: project.description,
            mainImage: project.images[0],
            additionalImages: project.images.slice(1),
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/admin")}
          isEdit
        />
      </main>
    </div>
  );
}
