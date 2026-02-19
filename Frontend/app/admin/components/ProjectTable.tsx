"use client";

import { Project } from "@/app/lib/auth";
import Button from "@/app/components/ui/Button";

interface ProjectTableProps {
  projects: Project[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectTable({ projects, onEdit, onDelete }: ProjectTableProps) {
  return (
    <div className="overflow-x-auto border border-border rounded-xl shadow-sm">
      <table className="w-full">
        <thead className="bg-foreground/5 border-b border-border">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Href</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Construction Date</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-foreground/5 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium">{project.title}</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                  {project.description}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                {project.herf}
              </td>
              <td className="px-6 py-4 text-sm">
                {new Date(project.constructionDate).toLocaleDateString('sv-SE')}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(project.id)}
                  className="text-accent hover:underline text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 hover:underline text-sm font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length === 0 && (
        <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
          No projects found. Create your first project!
        </div>
      )}
    </div>
  );
}