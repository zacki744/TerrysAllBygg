"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./components/AdminNavbar";
import ProjectTable from "./components/ProjectTable";
import SnickeriTable from "./components/SnickeriTable";
import Button from "../components/ui/Button";
import { AuthService, AdminAPI, Project } from "../lib/auth";
import styles from "./admin.module.css";
import Link from "next/link";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

async function fetchSnickerier(token: string): Promise<SnickeriItem[]> {
  const res = await fetch("/api/admin/snickerier", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load snickerier");
  return res.json();
}

export default function AdminDashboard() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [snickerier, setSnickerier] = useState<SnickeriItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadAll();
  }, [router]);

  const loadAll = async () => {
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      const [projectData, snickeriData] = await Promise.all([
        AdminAPI.getAllProjects(),
        fetchSnickerier(token),
      ]);
      setProjects(projectData);
      setSnickerier(snickeriData);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      AuthService.logout();
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  // ── Projects ───────────────────────────────────────────────

  const handleEditProject = (id: string) => {
    router.push(`/admin/projects/edit?id=${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await AdminAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete project");
    }
  };

  // ── Snickerier ─────────────────────────────────────────────

  const handleEditSnickeri = (id: string) => {
    router.push(`/admin/snickerier/edit?id=${id}`);
  };

  const handleDeleteSnickeri = async (id: string) => {
    if (!confirm("Är du säker på att du vill radera detta snickeri?")) return;
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      const res = await fetch(`/api/admin/snickerier/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setSnickerier((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Kunde inte radera snickeri");
    }
  };

  // ── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Laddar...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>

        {/* ── Projects section ── */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Project</h1>
            <p className={styles.pageSubtitle}>Hantera dina färdiga project</p>
          </div>
          <Button>
            <Link href="/admin/Projects/new">
              + New Project
            </Link>
          </Button>
        </div>

        <ProjectTable
          projects={projects}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
        />

        {/* ── Snickerier section ── */}
        <div className={styles.pageHeader} style={{ marginTop: "3rem" }}>
          <div>
            <h1 className={styles.pageTitle}>Snickerier</h1>
            <p className={styles.pageSubtitle}>Hantera dina färdiga snickerier</p>
          </div>
          <Button>
            <Link href="/admin/snickerier/new">
              + Nytt snickeri
            </Link>
        </Button>
        </div>

        <SnickeriTable
          items={snickerier}
          onEdit={handleEditSnickeri}
          onDelete={handleDeleteSnickeri}
        />

      </main>
    </div>
  );
}