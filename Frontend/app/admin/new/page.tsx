"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import ProjectForm from "../components/ProjectForm";
import { AdminAPI, CreateProjectRequest } from "@/app/lib/auth";
import styles from "../admin.module.css";

export default function NewProject() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CreateProjectRequest) => {
    setSubmitting(true);
    try {
      await AdminAPI.createProject(data);
      router.push("/admin");
    } catch (error) {
      console.error("Failed to create project:", error);
      setSubmitting(false);
      throw error;
    }
  };

  return (
    <div className={styles.page}>
      <AdminNavbar />

      <main className={styles.main}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "2rem" }}>
          Create New Project
        </h1>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin")}
        />
      </main>
    </div>
  );
}
