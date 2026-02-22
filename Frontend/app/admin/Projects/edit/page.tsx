"use client";

import { Suspense } from "react";
import EditProjectContent from "./EditProjectContent";

export default function EditProject() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    }>
      <EditProjectContent />
    </Suspense>
  );
}