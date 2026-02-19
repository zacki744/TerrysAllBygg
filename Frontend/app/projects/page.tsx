"use client";

import { Suspense } from "react";
import ProjectsPageContent from "@/app/projects/ProjectsPageContent";

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <ProjectsPageContent />
    </Suspense>
  );
}