"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./components/AdminNavbar";
import ProjectTable from "./components/ProjectTable";
import Button from "../components/ui/Button";
import { AuthService, AdminAPI, Project } from "../lib/auth";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadProjects();
  }, [router]);

  const loadProjects = async () => {
    try {
      const data = await AdminAPI.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
      AuthService.logout();
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/edit?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await AdminAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Projects</h1>
            <p className={styles.pageSubtitle}>Manage your building projects</p>
          </div>
          <Button onClick={() => router.push("/admin/new")}>
            + New Project
          </Button>
        </div>

        <ProjectTable
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
