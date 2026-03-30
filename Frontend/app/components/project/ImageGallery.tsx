"use client";

import { useState, useEffect } from "react";
import styles from "./../components.module.css";

type Props = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, images.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  if (images.length === 0) return null;

  return (
    <>
      {/* ── Gallery ── */}
      <div className={styles.gallery}>
        <img
          src={images[index]}
          alt={`${title} bild ${index + 1}`}
          className={styles.galleryImage}
          onClick={() => setLightboxOpen(true)}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className={`${styles.galleryBtn} ${styles.galleryBtnPrev}`}
              aria-label="Föregående bild"
            >
              ‹
            </button>
            <button
              onClick={next}
              className={`${styles.galleryBtn} ${styles.galleryBtnNext}`}
              aria-label="Nästa bild"
            >
              ›
            </button>

            <div className={styles.galleryDots}>
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  onClick={() => setIndex(i)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Stop click from closing when clicking the image itself */}
          <div
            className={styles.lightboxInner}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[index]}
              alt={`${title} bild ${index + 1}`}
              className={styles.lightboxImage}
            />
          </div>

          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Stäng"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxBtn} ${styles.lightboxBtnPrev}`}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Föregående bild"
              >
                ‹
              </button>
              <button
                className={`${styles.lightboxBtn} ${styles.lightboxBtnNext}`}
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Nästa bild"
              >
                ›
              </button>
            </>
          )}

          <span className={styles.lightboxCounter}>
            {index + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}