"use client";

import { useState } from "react";
import styles from "../../admin.module.css";

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
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // reset errors
    setError("");
    setErrors([]);

    if (images.length + files.length > maxImages) {
      setError(`Maximalt ${maxImages} bilder tillåtna`);
      return;
    }

    const oversizedFiles = files.filter((f) => f.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Vissa filer är större än 50MB");
      return;
    }

    setUploading(true);

    try {
      const uploadedPaths: string[] = [];
      const errorMessages: string[] = [];

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("image", file);

          const response = await fetch("/api/admin/image/upload", {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          let data: any = {};
          try {
            data = await response.json();
          } catch {
            // om backend inte returnerar JSON
          }

          if (!response.ok || !data?.success) {
            const msg =
              data?.error ||
              `Uppladdning misslyckades (${response.status})`;

            errorMessages.push(`${file.name}: ${msg}`);
            continue;
          }

          uploadedPaths.push(data.path);
        } catch (err) {
          errorMessages.push(`${file.name}: Nätverksfel / timeout`);
        }
      }

      if (uploadedPaths.length > 0) {
        onImagesChange([...images, ...uploadedPaths]);
      }

      if (errorMessages.length > 0) {
        setErrors(errorMessages);
      }
    } catch (err) {
      console.error("Uppladdningsfel:", err);
      setError("Kritiskt fel vid uppladdning. Försök igen.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imagePath = images[index];
    onImagesChange(images.filter((_, i) => i !== index));

    try {
      await fetch("/api/admin/image/delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
              <img
                src={img}
                alt={`Bild ${index + 1}`}
                className={styles.tileImg}
              />

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
            accept="image/*,.heic,.heif,.hif"
            multiple
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: "none" }}
          />

          <div
            className={`${styles.uploadZone} ${
              uploading ? styles.uploadZoneDisabled : ""
            }`}
          >
            {uploading ? (
              <div className={styles.spinner}>
                <div className={styles.spinnerRing} />
                <span className={styles.spinnerText}>Laddar upp...</span>
              </div>
            ) : (
              <div className={styles.uploadZoneInner}>
                <svg
                  className={styles.uploadIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>

                <span className={styles.uploadTitle}>
                  Lägg till bilder
                </span>

                <span className={styles.uploadSub}>
                  Klicka för att välja eller dra och släpp
                </span>

                <span className={styles.uploadMeta}>
                  PNG, JPG, WEBP, HEIC, HEIF, HIF (max 50MB per bild)
                </span>
              </div>
            )}
          </div>
        </label>
      )}

      {/* GLOBAL ERROR */}
      {error && <div className={styles.errorBox}>{error}</div>}

      {/* PER-FILE ERRORS */}
      {errors.length > 0 && (
        <div className={styles.errorBox}>
          <strong>Vissa bilder kunde inte laddas upp:</strong>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {images.length === 0 && (
        <p className={styles.noImages}>Inga bilder uppladdade än</p>
      )}
    </div>
  );
}