import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../lib/auth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "../../admin.module.css";
import { Link } from "react-router-dom";
import PageMeta from "../../components/PageMeta";

<PageMeta title="Admin" noIndex={true} />
export default function AdminLogin() {
  const navigate = useNavigate();
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
        navigate("/admin");
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

        <form onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div>
            <label className={styles.formLabel}>E-post</label>
            <Input
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

        <Link to="/" style={{
          fontSize: "0.875rem",
          color: "color-mix(in srgb, var(--foreground) 55%, transparent)",
          textDecoration: "none",
          textAlign: "center" as const,
        }}>
          ← Tillbaka till startsidan
        </Link>

      </div>
    </div>
  );
}