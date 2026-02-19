"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import ProjectForm from "../components/ProjectForm";
import { AdminAPI, CreateProjectRequest } from "@/app/lib/auth";

export default function NewProject() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProjectRequest) => {
    setSubmitting(true);
    try {
      const result = await AdminAPI.createProject(data);
      console.log("Project created:", result);
      router.push("/admin");
    } catch (error) {
      console.error("Failed to create project:", error);
      setSubmitting(false);
      // Error will be shown by ProjectForm
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-6 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin")}
        />
      </main>
    </div>
  );
}