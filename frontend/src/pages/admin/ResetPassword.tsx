import { useState, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "../../pages.module.css";
import PageMeta from "../../components/PageMeta";

<PageMeta title="Admin" noIndex={true} />
function ResetPasswordContent() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "1rem" }}>
          Ogiltig länk
        </h1>
        <p className={styles.pageSubtitle}>
          Återställningslänken saknas eller är felaktig.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken");
      return;
    }
    if (password !== confirm) {
      setError("Lösenorden matchar inte");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Något gick fel. Länken kan ha gått ut.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "1rem" }}>
          Lösenord uppdaterat!
        </h1>
        <p className={styles.pageSubtitle} style={{ marginBottom: "2rem" }}>
          Ditt lösenord har bytts. Du kan nu logga in med ditt nya lösenord.
        </p>
        <Button onClick={() => navigate("/admin/login")}>
          Gå till inloggning
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className={styles.pageTitle} style={{ marginBottom: "0.5rem" }}>
        Nytt lösenord
      </h1>
      <p className={styles.pageSubtitle} style={{ marginBottom: "2rem" }}>
        Ange ditt nya lösenord nedan. Länken är giltig i 24 timmar.
      </p>

      <form onSubmit={handleSubmit} className={styles.bookForm}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Nytt lösenord</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minst 8 tecken"
            required
            autoComplete="new-password"
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Bekräfta nytt lösenord</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Upprepa lösenordet"
            required
            autoComplete="new-password"
          />
        </div>
        {error && <div className={styles.snickeriInquiryError}>{error}</div>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sparar..." : "Spara nytt lösenord"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.pageCenter}>
      <div style={{ width: "100%", maxWidth: "28rem", padding: "2rem" }}>
        <Suspense fallback={<p className={styles.stateText}>Laddar...</p>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}