"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "../ui/Button";

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
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center">
      <Image
        src={images[index]}
        alt={`${title} image ${index + 1}`}
        width={400}
        height={300}
        className="rounded-xl object-cover w-full h-full border border-gray-200"
      />

      {images.length > 1 && (
        <>
          {/* Prev / Next buttons */}
          <Button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 px-3 py-2 shadow"
          >
            ‹
          </Button>
          <Button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 px-3 py-2 shadow"
          >
            ›
          </Button>

          {/* Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === index ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
