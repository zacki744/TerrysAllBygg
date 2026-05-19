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
    throw new Error("Session expired");
  }

  return res;
}

export const AdminAPI = {
  async getAllProjects(): Promise<Project[]> {
    const res = await adminFetch("/api/admin/projects");
    if (!res.ok) throw new Error("Failed to load projects");
    return res.json();
  },

  async getProject(id: string): Promise<any> {
    const res = await adminFetch(`/api/admin/projects/${id}`);
    if (!res.ok) throw new Error("Project not found");
    return res.json();
  },

  async createProject(data: any): Promise<any> {
    const res = await adminFetch("/api/admin/projects", {
      method: "POST",
      body:   JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create project");
    return res.json();
  },
  
  async updateProject(id: string, data: any): Promise<void> {
    const res = await adminFetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update project");
  },

  async deleteProject(id: string): Promise<void> {
    const res = await adminFetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete project");
  },
};