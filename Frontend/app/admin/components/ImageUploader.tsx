"use client";

import { useState } from "react";
import styles from "../admin.module.css";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  label = "Ladda upp bilder",
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximalt ${maxImages} bilder tillåtna`);
      return;
    }

    const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Vissa filer är större än 10MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const token = localStorage.getItem("admin_token");
      const uploadedPaths: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/admin/image/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          uploadedPaths.push(data.path);
        } else {
          console.error("Uppladdning misslyckades för fil:", file.name);
        }
      }

      onImagesChange([...images, ...uploadedPaths]);
    } catch (err) {
      console.error("Uppladdningsfel:", err);
      setError("Uppladdningen misslyckades. Försök igen.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imagePath = images[index];
    onImagesChange(images.filter((_, i) => i !== index));

    try {
      const token = localStorage.getItem("admin_token");
      await fetch("/api/admin/image/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: imagePath }),
      });
    } catch (err) {
      console.error("Raderingsfel:", err);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const next = [...images];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    onImagesChange(next);
  };

  return (
    <div className={styles.uploader}>

      <div className={styles.uploaderHeader}>
        <span className={styles.uploaderLabel}>{label}</span>
        <span className={styles.uploaderCount}>
          {images.length} / {maxImages}
        </span>
      </div>

      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageTile}>
              <img src={img} alt={`Bild ${index + 1}`} className={styles.tileImg} />

              <div className={styles.tileBadgeOrder}>#{index + 1}</div>
              {index === 0 && (
                <div className={styles.tileBadgeMain}>Huvud</div>
              )}

              <div className={styles.imageTileOverlay}>
                <div className={styles.tileNavButtons}>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className={styles.tileNavBtn}
                      title="Flytta vänster"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className={styles.tileNavBtn}
                      title="Flytta höger"
                    >
                      →
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className={styles.tileRemoveBtn}
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: "none" }}
          />
          <div className={`${styles.uploadZone} ${uploading ? styles.uploadZoneDisabled : ""}`}>
            {uploading ? (
              <div className={styles.spinner}>
                <div className={styles.spinnerRing} />
                <span className={styles.spinnerText}>Laddar upp...</span>
              </div>
            ) : (
              <div className={styles.uploadZoneInner}>
                <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className={styles.uploadTitle}>Lägg till bilder</span>
                <span className={styles.uploadSub}>Klicka för att välja eller dra och släpp</span>
                <span className={styles.uploadMeta}>PNG, JPG, GIF, WEBP (max 10MB per bild)</span>
              </div>
            )}
          </div>
        </label>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {images.length === 0 && (
        <p className={styles.noImages}>Inga bilder uppladdade än</p>
      )}

    </div>
  );
}