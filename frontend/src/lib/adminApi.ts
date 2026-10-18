// src/lib/adminApi.ts
// ══════════════════════════════════════════════════════════
// Alla anrop från admin till API:t.
// • Cookien skickas med (credentials: include).
// • 401 (utgången inloggning) → till inloggningssidan, överallt likadant.
// • Fel ger ett svenskt meddelande: serverns { error }, valideringsfel,
//   eller en reservtext.
// ══════════════════════════════════════════════════════════

import type { ApiSettings } from "./settings";
import type {
  AdminUser, MaintenanceReport, ProjectDetail, ProjectInput, ProjectOverview,
  SnickeriDetail, SnickeriInput, SnickeriOverview,
} from "./types";

/** Inloggningssidan med en förklaring, och sidan att komma tillbaka till efteråt. */
export const loginPathAfterExpiry = (returnTo: string) =>
  `/admin/login?utloggad=1&till=${encodeURIComponent(returnTo)}`;

function sessionExpired(): never {
  sessionStorage.removeItem("admin_email");
  window.location.href = loginPathAfterExpiry(window.location.pathname + window.location.search);
  throw new Error("Inloggningen har gått ut");
}

/** Felmeddelande ur ett API-svar: { error } eller ASP.NET:s valideringsfel. */
async function apiError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json();
    if (typeof data?.error === "string") return new Error(data.error);
    if (data?.errors) {
      const messages = Object.values(data.errors as Record<string, string[]>).flat();
      if (messages.length) return new Error(messages.join(" "));
    }
  } catch { /* inget JSON-svar */ }
  return new Error(fallback);
}

/**
 * Gör anropet och returnerar svaret som JSON (eller undefined för tomma svar).
 * body: objekt → JSON, FormData → skickas som det är (webbläsaren sätter Content-Type).
 */
async function request<T>(method: string, url: string, fallbackError: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      headers: body !== undefined && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new Error("Ingen kontakt med servern. Kontrollera uppkopplingen och försök igen.");
  }

  if (res.status === 401) sessionExpired();
  if (!res.ok) throw await apiError(res, fallbackError);

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const get  = <T>(url: string, err: string) => request<T>("GET", url, err);
const send = <T>(method: "POST" | "PUT" | "DELETE", url: string, err: string, body?: unknown) =>
  request<T>(method, url, err, body);

export const AdminAPI = {
  projects: {
    list:   () => get<ProjectOverview[]>("/api/admin/projects", "Kunde inte läsa projekten"),
    get:    (id: string) => get<ProjectDetail>(`/api/admin/projects/${id}`, "Projektet hittades inte"),
    create: (input: ProjectInput) => send<{ id: string }>("POST", "/api/admin/projects", "Kunde inte skapa projektet", input),
    update: (id: string, input: ProjectInput) => send<void>("PUT", `/api/admin/projects/${id}`, "Kunde inte spara projektet", input),
    remove: (id: string) => send<void>("DELETE", `/api/admin/projects/${id}`, "Kunde inte radera projektet"),
  },

  snickerier: {
    list:   () => get<SnickeriOverview[]>("/api/admin/snickerier", "Kunde inte läsa snickerierna"),
    get:    (id: string) => get<SnickeriDetail>(`/api/admin/snickerier/${id}`, "Snickeriet hittades inte"),
    create: (input: SnickeriInput) => send<{ id: string }>("POST", "/api/admin/snickerier", "Kunde inte skapa snickeriet", input),
    update: (id: string, input: SnickeriInput) => send<void>("PUT", `/api/admin/snickerier/${id}`, "Kunde inte spara snickeriet", input),
    remove: (id: string) => send<void>("DELETE", `/api/admin/snickerier/${id}`, "Kunde inte radera snickeriet"),
  },

  users: {
    list:      () => get<AdminUser[]>("/api/admin/users", "Kunde inte läsa användarna"),
    invite:    (email: string) =>
      send<{ message: string }>("POST", "/api/admin/users/invite", "Kunde inte skicka inbjudan", { email }),
    remove:    (id: string) => send<{ message: string }>("DELETE", `/api/admin/users/${id}`, "Kunde inte radera kontot"),
    sendReset: (id: string) =>
      send<{ message: string }>("POST", `/api/admin/users/${id}/reset-password`, "Kunde inte skicka länken"),
  },

  images: {
    /** Laddar upp en bild till uploads/projects och returnerar sökvägen. */
    async upload(file: File): Promise<string> {
      const body = new FormData();
      body.append("image", file);
      const data = await send<{ path?: string }>("POST", "/api/admin/image/upload", "Uppladdningen misslyckades", body);
      if (!data?.path) throw new Error("Uppladdningen misslyckades");
      return data.path;
    },
    /** Servern flyttar bara undan filen om inget sparat projekt använder den. */
    remove: (path: string) => send<void>("DELETE", "/api/admin/image/delete", "Kunde inte ta bort bilden", { path }),
    /** Provkörning (dryRun) eller en omgång av bildunderhållet. */
    maintenance: (dryRun: boolean) =>
      dryRun
        ? get<MaintenanceReport>("/api/admin/image/maintenance", "Kunde inte kontrollera bilderna")
        : send<MaintenanceReport>("POST", "/api/admin/image/maintenance", "Bildunderhållet avbröts"),
  },

  settings: {
    get:  () => get<ApiSettings>("/api/admin/settings", "Kunde inte läsa inställningarna"),
    save: (settings: ApiSettings) =>
      send<ApiSettings>("PUT", "/api/admin/settings", "Kunde inte spara inställningarna", settings),
    /** Laddar upp en ny hero-bild. Den används först när inställningarna sparas. */
    uploadHero(file: File) {
      const body = new FormData();
      body.append("image", file);
      return send<{ path: string; width: number; height: number }>(
        "POST", "/api/admin/settings/hero-image", "Bilden kunde inte laddas upp", body);
    },
  },
};
