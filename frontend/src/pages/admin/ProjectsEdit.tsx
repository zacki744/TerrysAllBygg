import { useEffect, useState } from "react";
import { useSearchParams, useNavigate  } from "react-router-dom";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import ProjectForm from "../../components/Admin/ProjectForm";
import { AdminAPI } from "../../lib/auth";
import { type UpdateProjectRequest, type DetailedProject } from "../../lib/project";
import styles from "../../admin.module.css";
import PageMeta from "../../components/PageMeta";

<PageMeta title="Admin" noIndex={true} />
export default function EditProjectContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<DetailedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      alert("No project ID provided");
      navigate("/admin");
      return;
    }
    loadProject();
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      const data = await AdminAPI.getProject(id);
      setProject(data);
    } catch {
      alert("Project not found");
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateProjectRequest) => {
    if (!id) return;
    await AdminAPI.updateProject(id, data);
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Edit Project
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
