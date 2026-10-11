// src/components/Admin/ImageUploader.tsx
// ── Bilder till projekt och snickerier ──
// • Ladda upp: klicka, eller dra filer från datorn till rutan.
// • Ordning: dra en bild till ny plats (dator) eller använd pilknapparna
//   (fungerar med tangentbord och på mobil). Första bilden är omslaget.
// • Knapparna syns alltid — de låg tidigare i en hover-ruta som inte gick att
//   nå på mobil eller med tangentbordet.

import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import { thumbUrl } from "../../lib/images";
import styles from "../../admin.module.css";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  label?: string;
  maxImages?: number;
}

const MAX_BYTES = 50 * 1024 * 1024;
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|hif)$/i;
const TILE_MIME = "application/x-tile-index";   // skiljer bildflytt från filer som dras in

const isImageFile = (f: File) => f.type.startsWith("image/") || IMAGE_EXT.test(f.name);

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function ImageUploader({
  images,
  onImagesChange,
  label = "Bilder",
  maxImages = 10,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors]     = useState<string[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const uploading = progress !== null;
  const room = maxImages - images.length;

  // ── Uppladdning ─────────────────────────────────────────

  const upload = async (files: File[]) => {
    setErrors([]);
    const problems: string[] = [];

    const accepted = files.filter((f) => {
      if (!isImageFile(f)) { problems.push(`${f.name}: inte en bild`); return false; }
      if (f.size > MAX_BYTES) { problems.push(`${f.name}: större än 50 MB`); return false; }
      return true;
    });

    if (accepted.length > room) {
      problems.push(`Högst ${maxImages} bilder – ${accepted.length - room} ${accepted.length - room === 1 ? "bild" : "bilder"} hoppades över.`);
      accepted.splice(room);
    }

    if (accepted.length === 0) { setErrors(problems); return; }

    // En i taget, så att servern inte får flera stora bilder samtidigt
    setProgress({ done: 0, total: accepted.length });
    let current = images;
    for (const [i, file] of accepted.entries()) {
      try {
        const body = new FormData();
        body.append("image", file);
        const res = await fetch("/api/admin/image/upload", { method: "POST", credentials: "include", body });
        const data: { success?: boolean; path?: string; error?: string } = await res.json().catch(() => ({}));

        if (!res.ok || !data.success || !data.path) {
          problems.push(`${file.name}: ${data.error ?? `uppladdningen misslyckades (${res.status})`}`);
        } else {
          current = [...current, data.path];
          onImagesChange(current);   // visa varje bild direkt när den är klar
        }
      } catch {
        problems.push(`${file.name}: nätverksfel – kontrollera uppkopplingen`);
      }
      setProgress({ done: i + 1, total: accepted.length });
    }

    setProgress(null);
    setErrors(problems);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Ordning och borttagning ─────────────────────────────

  const move = (from: number, to: number, how = "") => {
    if (to < 0 || to >= images.length || from === to) return;
    onImagesChange(moveItem(images, from, to));
    setAnnouncement(to === 0 ? `Bild ${from + 1} är nu omslagsbild` : `Bild flyttad${how} till plats ${to + 1}`);
  };

  const remove = async (index: number) => {
    const path = images[index];
    onImagesChange(images.filter((_, i) => i !== index));
    setAnnouncement(`Bild ${index + 1} borttagen`);

    // Servern flyttar bara undan filen om inget sparat projekt använder den
    try {
      await fetch("/api/admin/image/delete", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
    } catch { /* bildunderhållet städar senare */ }
  };

  // ── Dra och släpp ───────────────────────────────────────

  const isFileDrag = (e: React.DragEvent) => e.dataTransfer.types.includes("Files");

  const zoneHandlers = {
    onDragOver: (e: React.DragEvent) => {
      if (!isFileDrag(e) || uploading) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setDropActive(true);
    },
    onDragLeave: () => setDropActive(false),
    onDrop: (e: React.DragEvent) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      setDropActive(false);
      if (!uploading) upload(Array.from(e.dataTransfer.files));
    },
  };

  const tileHandlers = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(TILE_MIME, String(index));
      e.dataTransfer.effectAllowed = "move";
      setDragFrom(index);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes(TILE_MIME)) return;
      e.preventDefault();
      setDragOver(index);
    },
    onDrop: (e: React.DragEvent) => {
      const from = Number(e.dataTransfer.getData(TILE_MIME));
      if (Number.isNaN(from) || !e.dataTransfer.types.includes(TILE_MIME)) return;
      e.preventDefault();
      move(from, index, " med musen");
      setDragFrom(null); setDragOver(null);
    },
    onDragEnd: () => { setDragFrom(null); setDragOver(null); },
  });

  // ── Vy ──────────────────────────────────────────────────

  return (
    <div className={styles.uploader}>
      <div className={styles.uploaderHeader}>
        <span className={styles.uploaderLabel}>{label}</span>
        <span className={styles.uploaderCount}>{images.length} / {maxImages}</span>
      </div>

      {images.length > 0 && (
        <>
          <p className={styles.formHint} style={{ marginTop: 0 }}>
            Första bilden är omslaget på sajten. Dra bilderna för att ändra ordning, eller använd pilarna.
          </p>
          <ol className={styles.imageGrid}>
            {images.map((img, index) => {
              const n = index + 1;
              const tileClass = [
                styles.imageTile,
                dragFrom === index ? styles.imageTileDragging : "",
                dragOver === index && dragFrom !== index ? styles.imageTileDropTarget : "",
              ].join(" ");

              return (
                <li key={img} className={tileClass} {...tileHandlers(index)}>
                  <div className={styles.tileMedia}>
                    <img
                      src={thumbUrl(img)}
                      alt={`Bild ${n}`}
                      className={styles.tileImg}
                      draggable={false}
                      onError={(e) => { if (e.currentTarget.src !== img) e.currentTarget.src = img; }}
                    />
                    {index === 0
                      ? <span className={styles.tileBadgeMain}><Star size={12} aria-hidden /> Omslag</span>
                      : <span className={styles.tileBadgeOrder}>{n}</span>}
                    <span className={styles.tileGrip} aria-hidden><GripVertical size={16} /></span>
                  </div>

                  <div className={styles.tileBar}>
                    <button type="button" className={styles.tileBtn}
                      aria-label={`Flytta bild ${n} åt vänster`} aria-disabled={index === 0}
                      onClick={() => move(index, index - 1)}>
                      <ArrowLeft size={16} aria-hidden />
                    </button>
                    <button type="button" className={styles.tileBtn}
                      aria-label={`Flytta bild ${n} åt höger`} aria-disabled={index === images.length - 1}
                      onClick={() => move(index, index + 1)}>
                      <ArrowRight size={16} aria-hidden />
                    </button>
                    {index > 0 && (
                      <button type="button" className={styles.tileBtn}
                        aria-label={`Gör bild ${n} till omslagsbild`} title="Gör till omslag"
                        onClick={() => move(index, 0)}>
                        <Star size={16} aria-hidden />
                      </button>
                    )}
                    <button type="button" className={`${styles.tileBtn} ${styles.tileBtnDanger}`}
                      aria-label={`Ta bort bild ${n}`} title="Ta bort"
                      onClick={() => remove(index)}>
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {images.length < maxImages && (
        <div
          className={`${styles.uploadZone} ${uploading ? styles.uploadZoneDisabled : ""} ${dropActive ? styles.uploadZoneActive : ""}`}
          {...zoneHandlers}
        >
          {/* Riktig fil-input (dold visuellt men nåbar med Tab) */}
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*,.heic,.heif,.hif"
            multiple
            disabled={uploading}
            className={styles.visuallyHidden}
            onChange={(e) => upload(Array.from(e.target.files ?? []))}
          />
          <label htmlFor={inputId} className={styles.uploadZoneInner}>
            {uploading ? (
              <span className={styles.spinner}>
                <span className={styles.spinnerRing} aria-hidden />
                <span className={styles.spinnerText}>
                  Laddar upp {Math.min(progress.done + 1, progress.total)} av {progress.total}…
                </span>
              </span>
            ) : (
              <>
                <ImagePlus className={styles.uploadIcon} aria-hidden />
                <span className={styles.uploadTitle}>{dropActive ? "Släpp för att ladda upp" : "Lägg till bilder"}</span>
                <span className={styles.uploadSub}>Klicka för att välja, eller dra bilder hit</span>
                <span className={styles.uploadMeta}>
                  JPG, PNG, WEBP eller HEIC (iPhone), max 50 MB. Plats för {room} till.
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {errors.length > 0 && (
        <div className={styles.errorBox} role="alert">
          <strong>Alla bilder kom inte med:</strong>
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem" }}>
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p className={styles.noImages}>Inga bilder ännu – minst en behövs.</p>
      )}

      <p className={styles.visuallyHidden} aria-live="polite">{announcement}</p>
    </div>
  );
}
