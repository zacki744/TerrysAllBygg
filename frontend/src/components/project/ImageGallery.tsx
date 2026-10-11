// src/components/project/ImageGallery.tsx
// ── Bildgalleri för projekt och snickerier ──
// • Bläddra med pilar, miniatyrer (dator), prickar (mobil) eller svep.
// • Sidorna sätter key={id}, så att galleriet börjar om vid nytt projekt.
// • Klick/Enter på bilden öppnar helskärm i en <dialog>: webbläsaren sköter
//   fokusfälla, Esc och att sidan bakom blir inaktiv. Fokus återgår till
//   bilden när dialogen stängs.

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { thumbUrl } from "../../lib/images";
import styles from "./../components.module.css";

type Props = {
  images: string[];
  title: string;
};

const SWIPE_PX = 40;

/** Svep åt vänster/höger med finger (påverkar inte vertikal scroll). */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  return {
    swiped,   // true direkt efter ett svep, så att svepet inte räknas som klick
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const t = e.touches[0];
        start.current = { x: t.clientX, y: t.clientY };
        swiped.current = false;
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (!start.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.current.x;
        const dy = t.clientY - start.current.y;
        start.current = null;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
          swiped.current = true;
          if (dx > 0) onPrev(); else onNext();
        }
      },
    },
  };
}

export default function ImageGallery({ images, title }: Props) {
  const [index, setIndex]   = useState(0);
  const [open, setOpen]     = useState(false);
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  const dialogRef  = useRef<HTMLDialogElement>(null);
  const openerRef  = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const prev = useCallback(() => setIndex((i) => (i === 0 ? count - 1 : i - 1)), [count]);
  const next = useCallback(() => setIndex((i) => (i === count - 1 ? 0 : i + 1)), [count]);

  const gallerySwipe  = useSwipe(prev, next);
  const lightboxSwipe = useSwipe(prev, next);

  // Öppna/stäng dialogen och lås sidans scroll under tiden
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Förhämta grannbilderna så att bläddring känns direkt
  useEffect(() => {
    for (const i of [index - 1, index + 1]) {
      const url = images[(i + count) % count];
      if (url) new Image().src = url;
    }
  }, [index, images, count]);

  if (count === 0) return null;

  const current = images[index];
  const label = (i: number) => `${title}, bild ${i + 1} av ${count}`;

  const closeLightbox = () => {
    setOpen(false);
    openerRef.current?.focus();
  };

  return (
    <div className={styles.galleryWrap}>
      {/* ── Galleri ───────────────────────────────────────── */}
      <div className={styles.gallery} {...gallerySwipe.handlers}>
        {!loaded.has(current) && <div className={styles.galleryPlaceholder} aria-hidden />}

        <button
          ref={openerRef}
          type="button"
          className={styles.galleryOpen}
          onClick={() => { if (!gallerySwipe.swiped.current) setOpen(true); }}
          aria-label={`${label(index)}. Visa i helskärm`}
        >
          <img
            key={current}
            src={current}
            alt=""
            className={`${styles.galleryImage} ${loaded.has(current) ? styles.cardImageLoaded : styles.cardImageHidden}`}
            onLoad={() => setLoaded((s) => new Set(s).add(current))}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          <span className={styles.galleryZoomHint} aria-hidden>
            <Maximize2 size={14} /> Helskärm
          </span>
        </button>

        {count > 1 && (
          <>
            <button type="button" onClick={prev}
              className={`${styles.galleryBtn} ${styles.galleryBtnPrev}`}
              aria-label="Föregående bild"><ChevronLeft size={20} aria-hidden /></button>
            <button type="button" onClick={next}
              className={`${styles.galleryBtn} ${styles.galleryBtnNext}`}
              aria-label="Nästa bild"><ChevronRight size={20} aria-hidden /></button>

            {/* Prickar på mobil */}
            <div className={styles.galleryDots}>
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={styles.dotHit}
                  onClick={() => setIndex(i)}
                  aria-label={`Visa bild ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                >
                  <span className={`${styles.dot} ${i === index ? styles.dotActive : ""}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Miniatyrer på dator */}
      {count > 1 && (
        <div className={styles.galleryThumbs}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={i === index ? styles.galleryThumbActive : styles.galleryThumb}
              onClick={() => setIndex(i)}
              aria-label={`Visa bild ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              <img
                src={thumbUrl(src)}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) => { if (e.currentTarget.src !== src) e.currentTarget.src = src; }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Uppläses för skärmläsare när bilden byts */}
      <p className={styles.srOnly} aria-live="polite">Bild {index + 1} av {count}</p>

      {/* ── Helskärm ──────────────────────────────────────── */}
      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={`${title} – bilder`}
        onClose={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
          if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        }}
        onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}   // klick utanför bilden
        {...lightboxSwipe.handlers}
      >
        {open && (
          <>
            <img src={current} alt={label(index)} className={styles.lightboxImage} />

            <button type="button" className={styles.lightboxClose} onClick={closeLightbox}
              aria-label="Stäng helskärm" autoFocus>
              <X size={22} aria-hidden />
            </button>

            {count > 1 && (
              <>
                <button type="button" className={`${styles.lightboxBtn} ${styles.lightboxBtnPrev}`}
                  onClick={prev} aria-label="Föregående bild"><ChevronLeft size={26} aria-hidden /></button>
                <button type="button" className={`${styles.lightboxBtn} ${styles.lightboxBtnNext}`}
                  onClick={next} aria-label="Nästa bild"><ChevronRight size={26} aria-hidden /></button>
                <span className={styles.lightboxCounter} aria-hidden>{index + 1} / {count}</span>
              </>
            )}
          </>
        )}
      </dialog>
    </div>
  );
}
