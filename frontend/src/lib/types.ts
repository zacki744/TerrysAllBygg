// src/lib/types.ts
// ══════════════════════════════════════════════════════════
// Typerna för det API:t skickar och tar emot — på ett ställe.
// Fältnamnen motsvarar C#-modellerna i TABB/Model (camelCase).
// ══════════════════════════════════════════════════════════

// ── Projekt ─────────────────────────────────────────────────

export interface ProjectOverview {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string | null;   // kategorins slug (admin → Inställningar → Kategorier)
  location?: string | null;   // ort, valfri
}

export interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  images: string[];
  category?: string | null;
  location?: string | null;
  year?: number | null;       // valfritt
  scope?: string | null;      // omfattning, valfri: "6 veckor"
}

/** Det admin skickar när ett projekt skapas eller sparas. */
export interface ProjectInput {
  title: string;
  description: string;
  mainImage?: string;
  additionalImages: string[];
  category: string | null;
  location: string | null;
  year: number | null;
  scope: string | null;
}

// ── Snickerier ──────────────────────────────────────────────

export interface SnickeriOverview {
  id: string;
  title: string;
  description: string;
  price: number;              // kronor inklusive moms
  image: string;
}

export interface SnickeriDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
}

export interface SnickeriInput {
  title: string;
  description: string;
  price: number;
  mainImage?: string;
  additionalImages?: string[];
}

// ── Admin ───────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

/** Svar från bildunderhållet (ImageMaintenance i backend). */
export interface MaintenanceReport {
  scanned: number;
  remaining: number;
  optimized: number;
  converted: number;
  thumbnailsCreated: number;
  movedUnused: number;
  bytesBefore: number;
  bytesAfter: number;
  errors: string[];
  dryRun: boolean;
}
