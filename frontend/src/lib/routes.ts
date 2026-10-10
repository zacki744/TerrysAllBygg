// src/lib/routes.ts
// ══════════════════════════════════════════════════════════
// Enda stället där publika detalj-URL:er byggs.
// Format: /projekt/<id>/<slug> och /snickerier/<id>/<slug>
// id:t är det som används för uppslag — sluggen är bara för
// läsbarhet och SEO, så en gammal eller felstavad slug fungerar ändå.
// ══════════════════════════════════════════════════════════

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")   // övriga diakriter (é → e)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function withSlug(base: string, id: string, title?: string): string {
  const slug = title ? slugify(title) : "";
  return slug ? `${base}/${id}/${slug}` : `${base}/${id}`;
}

export const projectPath  = (id: string, title?: string) => withSlug("/projekt", id, title);
export const snickeriPath = (id: string, title?: string) => withSlug("/snickerier", id, title);
