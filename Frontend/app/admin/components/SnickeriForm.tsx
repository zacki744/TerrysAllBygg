"use client";

import { useState } from "react";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Button from "@/app/components/ui/Button";
import ImageUploader from "./ImageUploader";
import styles from "../admin.module.css";

export interface SnickeriFormData {
  title: string;
  description: string;
  price: number;
  mainImage?: string;
  additionalImages?: string[];
}

interface SnickeriFormProps {
  initialData?: SnickeriFormData;
  onSubmit: (data: SnickeriFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function SnickeriForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: SnickeriFormProps) {
  const initialImages = [
    ...(initialData?.mainImage ? [initialData.mainImage] : []),
    ...(initialData?.additionalImages || []),
  ];

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
  });

  const [images, setImages] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Vänligen ladda upp minst en bild");
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Ange ett giltigt pris");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        price: parsedPrice,
        mainImage: images[0],
        additionalImages: images.slice(1),
      });
    } catch (err: any) {
      setError(err.message || "Kunde inte spara snickeri");
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
          placeholder="t.ex. Ek-stol med svarvade ben"
          required
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Beskrivning</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Beskriv snuckeriet, material, dimensioner, finish..."
          rows={5}
          required
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Pris (kr)</label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
          placeholder="t.ex. 4500"
          required
        />
        <p className={styles.formHint}>Ange priset i svenska kronor, exkl. moms.</p>
      </div>

      <div className={styles.card}>
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          label="Bilder"
          maxImages={10}
        />
        <p className={styles.formHint} style={{ marginTop: "0.5rem" }}>
          📌 Den första bilden används som huvudbild.
        </p>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.formActions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Sparar..." : isEdit ? "Uppdatera" : "Skapa snickeri"}
        </Button>
        <button type="button" onClick={onCancel} className={styles.btnGhost}>
          Avbryt
        </button>
      </div>

    </form>
  );
}
