import { useState, useEffect, useCallback } from "react";
import styles from "./../components.module.css";

type Props = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: Props) {
  const [index, setIndex]         = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loaded, setLoaded]       = useState<boolean[]>(() => images.map(() => false));

  const prev = useCallback(
    () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  );

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
  }, [lightboxOpen, prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  // Prefetch adjacent images when user navigates
  useEffect(() => {
    const prefetch = (url: string) => {
      const img = new Image();
      img.src = url;
    };
    if (images[index + 1]) prefetch(images[index + 1]);
    if (images[index - 1]) prefetch(images[index - 1]);
  }, [index, images]);

  if (images.length === 0) return null;

  const markLoaded = (i: number) =>
    setLoaded((prev) => { const next = [...prev]; next[i] = true; return next; });

  return (
    <>
      {/* ── Gallery ────────────────────────────────────────── */}
      <div className={styles.gallery}>

        {/* Shimmer placeholder until image loads */}
        {!loaded[index] && (
          <div className={styles.galleryPlaceholder} aria-hidden />
        )}

        <img
          src={images[index]}
          alt={`${title} bild ${index + 1}`}
          className={`${styles.galleryImage} ${loaded[index] ? styles.cardImageLoaded : styles.cardImageHidden}`}
          onClick={() => setLightboxOpen(true)}
          onLoad={() => markLoaded(index)}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />

        {images.length > 1 && (
          <>
            <button onClick={prev}
              className={`${styles.galleryBtn} ${styles.galleryBtnPrev}`}
              aria-label="Föregående bild">‹</button>
            <button onClick={next}
              className={`${styles.galleryBtn} ${styles.galleryBtnNext}`}
              aria-label="Nästa bild">›</button>

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

      {/* ── Lightbox ───────────────────────────────────────── */}
      {lightboxOpen && (
        <div className={styles.lightboxBackdrop} onClick={() => setLightboxOpen(false)}>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <img
              src={images[index]}
              alt={`${title} bild ${index + 1}`}
              className={styles.lightboxImage}
            />
          </div>

          <button className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Stäng">×</button>

          {images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxBtn} ${styles.lightboxBtnPrev}`}
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Föregående bild">‹</button>
              <button
                className={`${styles.lightboxBtn} ${styles.lightboxBtnNext}`}
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Nästa bild">›</button>
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