"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProjectMeta from "@/app/components/project/ProjectMeta";
import ImageGallery from "@/app/components/project/ImageGallery";
import Button from "@/app/components/ui/Button";

export default function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetch(`/api/projects/details/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Project not found');
        return res.json();
      })
      .then(setProject)
      .catch(err => {
        console.error(err);
        setProject(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p>Inget projekt valt.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p>Laddar…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p>Projektet hittades inte.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        {/* Title */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold">{project.title}</h1>
          <p className="text-lg text-zinc-600">{project.description}</p>
        </header>

        {/* Main content: image + sidebar */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image carousel */}
          <div className="flex-1 border border-border rounded-xl p-4 shadow-md">
            <ImageGallery images={project.images} title={project.title} />
          </div>

          {/* Sidebar info */}
          <aside className="flex-1 border border-border rounded-xl p-6 shadow-md md:max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Projektinfo</h2>
            <ProjectMeta constructionDate={project.constructionDate} />
            
            <div className="mt-6 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">Plats</p>
                <p className="text-zinc-600">Österlen, Skåne</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Utfört av</p>
                <p className="text-zinc-600">Terrys All Bygg</p>
              </div>
            </div>
          </aside>
        </div>

        {/* Description */}
        <section className="prose prose-neutral max-w-none">
          <h2 className="text-2xl font-semibold">Beskrivning</h2>
          <p className="text-zinc-700 leading-relaxed">
            {project.description}
          </p>
        </section>

        {/* Back button */}
        <Button>
          <a href="/">← Tillbaka till projekt</a>
        </Button>
      </main>

      <Footer />
    </div>
  );
}