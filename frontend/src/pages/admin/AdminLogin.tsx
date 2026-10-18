import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "../../lib/auth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "../../admin.module.css";
import { Link } from "react-router-dom";

// Bara sidor i admin — aldrig en extern adress
const safeReturn = (path: string | null) =>
  path && path.startsWith("/admin") && !path.startsWith("/admin/login") ? path : "/admin";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get("utloggad") === "1";
  const returnTo = safeReturn(params.get("till"));
  const [form, setForm] = useState({ email: "", password: "" });
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
      const success = await AuthService.login(form.email, form.password);
      if (success) {
        navigate(returnTo, { replace: true });
      } else {
        setError("Fel e-post eller lösenord.");
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

        {expired && (
          <p className={styles.noticeBox} role="status">
            Du har varit inloggad länge och behöver logga in igen. Ändringar som inte
            sparats hann tyvärr inte komma med.
          </p>
        )}

        <form onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div>
            <label htmlFor="login-email" className={styles.formLabel}>E-post</label>
            <Input
              id="login-email"
              name="email"
              type="email"
              placeholder="din@email.se"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="login-password" className={styles.formLabel}>Lösenord</label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="Ange lösenord"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.errorBox} role="alert">{error}</div>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Loggar in..." : "Logga in"}
          </Button>

        </form>

        <Link to="/" style={{
          fontSize: "0.875rem",
          color: "color-mix(in srgb, var(--foreground) 72%, transparent)",
          textDecoration: "none",
          textAlign: "center" as const,
        }}>
          ← Tillbaka till startsidan
        </Link>

      </div>
    </div>
  );
}