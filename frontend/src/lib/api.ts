// src/lib/api.ts
// ══════════════════════════════════════════════════════════
// Publika API-anrop: adresser och svarstyper på ett ställe.
// Hämtas med useFetch (src/hooks/useFetch.ts).
// Admin-anropen ligger i lib/auth.ts (AdminAPI).
// ══════════════════════════════════════════════════════════

export type { Project as ProjectOverview, DetailedProject as ProjectDetail } from "./project";

export interface SnickeriOverview {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface SnickeriDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
}

export const API = {
  projects:   "/api/projects",
  project:    (id: string) => `/api/projects/details/${encodeURIComponent(id)}`,
  snickerier: "/api/snickerier",
  snickeri:   (id: string) => `/api/snickerier/details/${encodeURIComponent(id)}`,
} as const;

/** Fel från API:t med HTTP-status, så att sidor kan skilja 404 från nätverksfel. */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message = `HTTP ${status}`) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isNotFound = (err: unknown) => err instanceof ApiError && err.status === 404;

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new ApiError(res.status);
  return res.json() as Promise<T>;
}
