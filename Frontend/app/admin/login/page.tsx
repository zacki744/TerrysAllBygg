"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import { AuthService } from "@/app/lib/auth";
import styles from "../admin.module.css";
import Link from "next/dist/client/link";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.login({ username, password });
      router.push("/admin");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageCenter} style={{ padding: "0 1.5rem" }}>
      <div className={styles.loginBox}>

        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Admin Login</h1>
          <p className={styles.loginSubtitle}>Sign in to manage your projects</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <Link
          href="/"
          className={styles.backLink}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
