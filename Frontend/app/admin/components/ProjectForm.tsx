"use client";

import { useState } from "react";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Button from "@/app/components/ui/Button";
import ImageUploader from "./ImageUploader";
import { CreateProjectRequest, UpdateProjectRequest } from "@/app/lib/auth";

interface ProjectFormProps {
  initialData?: UpdateProjectRequest & { id?: string };
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, onSubmit, onCancel, isEdit = false }: ProjectFormProps) {
  // Combine initial images into a single array
  const initialImages = [
    ...(initialData?.mainImage ? [initialData.mainImage] : []),
    ...(initialData?.additionalImages || [])
  ];

  const [formData, setFormData] = useState({
    href: initialData?.href || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    constructionDate: initialData?.constructionDate || new Date().toISOString().split('T')[0],
  });
  
  const [images, setImages] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      // First image is main, rest are additional
      const submitData: CreateProjectRequest = {
        href: formData.href,
        title: formData.title,
        description: formData.description,
        constructionDate: formData.constructionDate,
        mainImage: images[0],
        additionalImages: images.slice(1)
      };
      
      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g., Utomhusbastu"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">URL Slug (href)</label>
        <Input
          type="text"
          value={formData.href}
          onChange={(e) => handleChange("href", e.target.value)}
          placeholder="e.g., outdoor-sauna"
          pattern="[a-z0-9-]+"
          title="Only lowercase letters, numbers, and hyphens"
          required
        />
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
          Used in URL: /projects?herf={formData.href || "your-slug"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the project..."
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Construction Date</label>
        <Input
          type="date"
          value={formData.constructionDate}
          onChange={(e) => handleChange("constructionDate", e.target.value)}
          required
        />
      </div>

      {/* Image Upload - Multiple Images in List */}
      <div className="border border-border rounded-lg p-6">
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          label="Project Images"
          maxImages={10}
        />
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
          📌 The first image will be used as the main thumbnail. Use arrows to reorder.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full border border-border hover:bg-foreground/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}