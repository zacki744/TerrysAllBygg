"use client";

import { useState } from "react";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Button from "@/app/components/ui/Button";
import ImageUploader from "./ImageUploader";
import { CreateProjectRequest, UpdateProjectRequest } from "@/app/lib/auth";
import styles from "../admin.module.css";

interface ProjectFormProps {
  initialData?: UpdateProjectRequest & { id?: string };
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ProjectFormProps) {
  const initialImages = [
    ...(initialData?.mainImage ? [initialData.mainImage] : []),
    ...(initialData?.additionalImages || []),
  ];

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || ""
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
      const submitData: CreateProjectRequest = {
        title: formData.title,
        description: formData.description,
        mainImage: images[0],
        additionalImages: images.slice(1),
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
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Titel</label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="e.g., Utomhusbastu"
          required
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Beskrivning</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the project..."
          rows={4}
          required
        />
      </div>

      <div className={styles.card}>
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          label="Project Images"
          maxImages={10}
        />
        <p className={styles.formHint} style={{ marginTop: "0.5rem" }}>
          📌 Den första bilden används som huvudbild.
        </p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.formActions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Project" : "Create Project"}
        </Button>
        <button type="button" onClick={onCancel} className={styles.btnGhost}>
          Avbryt
        </button>
      </div>

    </form>
  );
}
