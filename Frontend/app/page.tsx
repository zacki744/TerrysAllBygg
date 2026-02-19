"use client";

import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProjectCard from "./components/ProjectCard";
import Footer from "./components/Footer";

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="mx-auto max-w-5xl px-6">
        <Hero />
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">
            Tidigare projekt
          </h2>
          {loading && <p>Loading projects…</p>}
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                image={project.image}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}