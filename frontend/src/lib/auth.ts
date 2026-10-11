import type { CreateProjectRequest, DetailedProject, UpdateProjectRequest } from "./project";
import type { ApiSettings } from "./settings";
// app/lib/auth.ts

export interface Project {
  id: string;
  href: string;
  title: string;
  description: string;
  image: string;
}

// ── Auth helpers ───────────────────────────────────────────

export const AuthService = {
  async login(email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      sessionStorage.setItem("admin_email", data.email ?? email);
      return true;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch("/api/admin/auth/logout", {
        method:      "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem("admin_email");
    }
  },

  async checkAuth(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/auth/me", {
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem("admin_email");
  },

  getEmail(): string {
    return sessionStorage.getItem("admin_email") ?? "";
  },
};

// ── Admin API ──────────────────────────────────────────────

async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    sessionStorage.removeItem("admin_email");
    window.location.href = "/admin/login";
    throw new Error("Inloggningen har gått ut");
  }

  return res;
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

export const SettingsAPI = {
  async get(): Promise<ApiSettings> {
    const res = await adminFetch("/api/admin/settings");
    if (!res.ok) throw await apiError(res, "Kunde inte läsa inställningarna");
    return res.json();
  },

  async save(settings: ApiSettings): Promise<ApiSettings> {
    const res = await adminFetch("/api/admin/settings", {
      method: "PUT",
      body:   JSON.stringify(settings),
    });
    if (!res.ok) throw await apiError(res, "Kunde inte spara inställningarna");
    return res.json();
  },

  /** Laddar upp en ny hero-bild. Den används först när inställningarna sparas. */
  async uploadHeroImage(file: File): Promise<{ path: string; width: number; height: number }> {
    const body = new FormData();
    body.append("image", file);
    // Inte adminFetch: webbläsaren måste själv sätta Content-Type för FormData
    const res = await fetch("/api/admin/settings/hero-image", {
      method: "POST", credentials: "include", body,
    });
    if (res.status === 401) {
      sessionStorage.removeItem("admin_email");
      window.location.href = "/admin/login";
    }
    if (!res.ok) throw await apiError(res, "Bilden kunde inte laddas upp");
    return res.json();
  },
};

export const AdminAPI = {
  async getAllProjects(): Promise<Project[]> {
    const res = await adminFetch("/api/admin/projects");
    if (!res.ok) throw new Error("Kunde inte läsa projekten");
    return res.json();
  },

  async getProject(id: string): Promise<DetailedProject> {
    const res = await adminFetch(`/api/admin/projects/${id}`);
    if (!res.ok) throw new Error("Projektet hittades inte");
    return res.json();
  },

  async createProject(data: CreateProjectRequest): Promise<{ id: string }> {
    const res = await adminFetch("/api/admin/projects", {
      method: "POST",
      body:   JSON.stringify(data),
    });
    if (!res.ok) throw await apiError(res, "Kunde inte skapa projektet");
    return res.json();
  },
  
  async updateProject(id: string, data: UpdateProjectRequest): Promise<void> {
    const res = await adminFetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    });
    if (!res.ok) throw await apiError(res, "Kunde inte spara projektet");
  },

  async deleteProject(id: string): Promise<void> {
    const res = await adminFetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Kunde inte radera projektet");
  },
};