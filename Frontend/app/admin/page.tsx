"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./components/AdminNavbar";
import ProjectTable from "./components/ProjectTable";
import SnickeriTable from "./components/SnickeriTable";
import { AuthService, AdminAPI, Project } from "../lib/auth";
import styles from "./admin.module.css";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

async function fetchSnickerier(): Promise<SnickeriItem[]> {
  const res = await fetch("/api/admin/snickerier", {
    credentials: "include",   // cookie sent automatically
  });
  if (!res.ok) throw new Error("Failed to load snickerier");
  return res.json();
}

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects]   = useState<Project[]>([]);
  const [snickerier, setSnickerier] = useState<SnickeriItem[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    // Quick local check first, then verify with server
    if (!AuthService.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadAll();
  }, [router]);

  const loadAll = async () => {
    try {
      const [projectData, snickeriData] = await Promise.all([
        AdminAPI.getAllProjects(),
        fetchSnickerier(),
      ]);
      setProjects(projectData);
      setSnickerier(snickeriData);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject  = (id: string) => router.push(`/admin/projects/edit?id=${id}`);
  const handleEditSnickeri = (id: string) => router.push(`/admin/snickerier/edit?id=${id}`);

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Är du säker på att du vill radera detta projekt?")) return;
    try {
      await AdminAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Kunde inte radera projekt");
    }
  };

  const handleDeleteSnickeri = async (id: string) => {
    if (!confirm("Är du säker på att du vill radera detta snickeri?")) return;
    try {
      const res = await fetch(`/api/admin/snickerier/${id}`, {
        method:      "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setSnickerier((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Kunde inte radera snickeri");
    }
  };

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

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Projekt</h1>
            <p className={styles.pageSubtitle}>Hantera dina byggprojekt</p>
          </div>
          <button className={styles.addButton}
            onClick={() => router.push("/admin/projects/new")}>
            <Plus size={18} strokeWidth={2} />
            <span>Nytt projekt</span>
          </button>
        </div>

        <ProjectTable projects={projects}
          onEdit={handleEditProject} onDelete={handleDeleteProject} />

        <div className={styles.pageHeader} style={{ marginTop: "3rem" }}>
          <div>
            <h1 className={styles.pageTitle}>Snickerier</h1>
            <p className={styles.pageSubtitle}>Hantera dina färdiga snickerier</p>
          </div>
          <button className={styles.addButton}
            onClick={() => router.push("/admin/snickerier/new")}>
            <Plus size={18} strokeWidth={2} />
            <span>Nytt snickeri</span>
          </button>
        </div>

        <SnickeriTable items={snickerier}
          onEdit={handleEditSnickeri} onDelete={handleDeleteSnickeri} />

      </main>
    </div>
  );
}