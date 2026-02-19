"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./components/AdminNavbar";
import ProjectTable from "./components/ProjectTable";
import Button from "../components/ui/Button";
import { AuthService, AdminAPI, Project } from "../lib/auth";

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
    // Use query parameter instead of dynamic route
    router.push(`/admin/edit?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await AdminAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-12 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage your building projects
            </p>
          </div>
          <Button onClick={() => router.push("/admin/new.html")}>
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