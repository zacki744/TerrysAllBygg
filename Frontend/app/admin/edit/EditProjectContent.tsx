"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import ProjectForm from "../components/ProjectForm";
import { AdminAPI, UpdateProjectRequest, DetailedProject } from "@/app/lib/auth";

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
    } catch (error) {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
        <ProjectForm
          initialData={{
            href: project.herf,
            title: project.title,
            description: project.description,
            constructionDate: project.constructionDate,
            mainImage: project.images[0],
            additionalImages: project.images.slice(1),
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin.html")}
          isEdit
        />
      </main>
    </div>
  );
}