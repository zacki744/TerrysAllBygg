"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import ProjectForm from "../../components/ProjectForm";
import { AdminAPI, UpdateProjectRequest, DetailedProject } from "@/app/lib/auth";
import styles from "../../admin.module.css";

export default function EditProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<DetailedProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      alert("No project ID provided");
      router.push("/admin");
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
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateProjectRequest) => {
    if (!id) return;
    await AdminAPI.updateProject(id, data);
    router.push("/admin");
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
          onCancel={() => router.push("/admin")}
          isEdit
        />
      </main>
    </div>
  );
}
