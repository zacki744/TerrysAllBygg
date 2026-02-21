"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./../components.module.css";

type Props = {
  images: string[];
  title: string;
};

export default function ImageGallery({ images, title }: Props) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (images.length === 0) return null;

  return (
    <div className={styles.gallery}>
      <Image
        src={images[index]}
        alt={`${title} image ${index + 1}`}
        width={400}
        height={300}
        className={styles.galleryImage}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className={`${styles.galleryBtn} ${styles.galleryBtnPrev}`}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            onClick={next}
            className={`${styles.galleryBtn} ${styles.galleryBtnNext}`}
            aria-label="Next image"
          >
            ›
          </button>

          <div className={styles.galleryDots}>
            {images.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
