import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "../../pages.module.css";
import PageMeta from "../../components/PageMeta";

<PageMeta title="Admin" noIndex={true} />
function AcceptInviteContent() {
  const [searchParams] = useSearchParams();
  const navigate     =  useNavigate();
  const token        = searchParams.get("token") ?? "";

  const [email, setEmail]       = useState("");
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  // Validate token on load
  useEffect(() => {
    if (!token) { setValidating(false); return; }

    fetch(`/api/admin/auth/validate-token?token=${token}&type=invite`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenValid(true);
          setEmail(data.email);
        }
      })
      .catch(() => {})
      .finally(() => setValidating(false));
  }, [token]);

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
      const res = await fetch("/api/admin/auth/accept-invite", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Något gick fel. Försök igen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return <p className={styles.stateText}>Validerar länk...</p>;
  }

  if (!token || !tokenValid) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "1rem" }}>
          Ogiltig länk
        </h1>
        <p className={styles.pageSubtitle}>
          Inbjudningslänken är ogiltig eller har gått ut (giltig i 1 timme).
          Kontakta en befintlig administratör för en ny inbjudan.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: "1rem" }}>
          Konto skapat!
        </h1>
        <p className={styles.pageSubtitle} style={{ marginBottom: "2rem" }}>
          Ditt admin-konto för {email} är nu aktivt.
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
        Skapa ditt konto
      </h1>
      <p className={styles.pageSubtitle} style={{ marginBottom: "2rem" }}>
        Du bjuds in som administratör med e-postadressen <strong>{email}</strong>.
        Välj ett lösenord för att aktivera ditt konto.
      </p>

      <form onSubmit={handleSubmit} className={styles.bookForm}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Lösenord</label>
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
          <label className={styles.formLabel}>Bekräfta lösenord</label>
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
          {submitting ? "Skapar konto..." : "Aktivera konto"}
        </Button>
      </form>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className={styles.pageCenter}>
      <div style={{ width: "100%", maxWidth: "28rem", padding: "2rem" }}>
        <Suspense fallback={<p className={styles.stateText}>Laddar...</p>}>
          <AcceptInviteContent />
        </Suspense>
      </div>
    </div>
  );
}