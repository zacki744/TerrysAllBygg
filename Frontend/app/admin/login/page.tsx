"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/app/lib/auth";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import styles from "../admin.module.css";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await AuthService.login({ username: form.username, password: form.password });
      console.log("Login success?:", success);
      if (success) {
        router.push("/admin");
      } else {
        setError("Fel användarnamn eller lösenord.");
      }
    } catch {
      setError("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageCenter}>
      <div className={styles.loginBox}>

        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Admin</h1>
          <p className={styles.loginSubtitle}>Logga in för att hantera sidan</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div>
            <label className={styles.formLabel}>Användarnamn</label>
            <Input
              name="username"
              placeholder="Ange användarnamn"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className={styles.formLabel}>Lösenord</label>
            <Input
              name="password"
              type="password"
              placeholder="Ange lösenord"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Loggar in..." : "Logga in"}
          </Button>

        </form>

        <Link
          href="/"
          style={{
            fontSize: "0.875rem",
            color: "color-mix(in srgb, var(--foreground) 55%, transparent)",
            textDecoration: "none",
            textAlign: "center" as const,
          }}
        >
          ← Tillbaka till startsidan
        </Link>

      </div>
    </div>
  );
}