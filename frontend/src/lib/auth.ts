// src/lib/auth.ts
// Inloggning och utloggning i admin. Själva admin-anropen finns i lib/adminApi.ts.

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

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem("admin_email");
  },

  getEmail(): string {
    return sessionStorage.getItem("admin_email") ?? "";
  },
};
