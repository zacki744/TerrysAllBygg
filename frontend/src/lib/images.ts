// src/lib/images.ts
// ══════════════════════════════════════════════════════════
// Uppladdade bilder finns i två storlekar (se TABB/API/Helpers/ImageProcessor.cs):
//   /uploads/projects/<namn>.<ext>          — max 1600 px, galleri och lightbox
//   /uploads/projects/thumbs/<namn>.webp    — max 640 px, kort och listor
// ══════════════════════════════════════════════════════════

export const THUMB_WIDTH = 640;
export const FULL_WIDTH  = 1600;

/** Miniatyrens URL för en uppladdad bild. Andra bilder returneras oförändrade. */
export function thumbUrl(path: string): string {
  const match = path.match(/^(\/uploads\/[^/]+)\/([^/]+?)\.[a-z0-9]+$/i);
  return match ? `${match[1]}/thumbs/${match[2]}.webp` : path;
}

/** srcset med miniatyr + fullstorlek, så att webbläsaren väljer efter skärm. */
export function cardSrcSet(path: string): string | undefined {
  const thumb = thumbUrl(path);
  return thumb === path ? undefined : `${thumb} ${THUMB_WIDTH}w, ${path} ${FULL_WIDTH}w`;
}
