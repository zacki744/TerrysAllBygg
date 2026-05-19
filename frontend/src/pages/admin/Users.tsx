import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Trash2, KeyRound } from "lucide-react";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import { AuthService } from "../../lib/auth";
import styles from "../../admin.module.css";

interface AdminUser {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    load();
  }, [navigate]);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setMessage({ text: "Kunde inte ladda användare", ok: false });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: data.message, ok: true });
      setInviteEmail("");
    } catch (err: any) {
      setMessage({ text: err.message || "Kunde inte skicka inbjudan", ok: false });
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Är du säker på att du vill radera ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMessage({ text: "Konto raderat", ok: true });
    } catch (err: any) {
      setMessage({ text: err.message || "Kunde inte radera konto", ok: false });
    }
  };

  const handleReset = async (id: string, email: string) => {
    if (!confirm(`Skicka återställningslänk till ${email}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: data.message, ok: true });
    } catch (err: any) {
      setMessage({ text: err.message || "Kunde inte skicka länk", ok: false });
    }
  };

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Laddar...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <AdminNavbar />
      <main className={styles.main}>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Användare</h1>
            <p className={styles.pageSubtitle}>Hantera admin-konton</p>
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={message.ok ? styles.successBox : styles.errorBox}
            style={{ marginBottom: "1.5rem" }}>
            {message.text}
          </div>
        )}

        {/* Invite form */}
        <div className={styles.card} style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem",
            color: "var(--foreground)" }}>
            Bjud in ny administratör
          </h2>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: "0.75rem",
            flexWrap: "wrap" }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="e-post@exempel.se"
              required
              className={styles.inlineInput}
            />
            <button type="submit" disabled={inviting} className={styles.addButton}>
              <Mail size={16} strokeWidth={2} />
              <span>{inviting ? "Skickar..." : "Skicka inbjudan"}</span>
            </button>
          </form>
        </div>

        {/* Users table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>E-post</th>
                <th className={styles.tableHeadCell}>Skapad</th>
                <th className={styles.tableHeadCellRight}>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <span className={styles.tablePrimary}>{user.email}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.tableSecondary}>
                      {new Date(user.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                  </td>
                  <td className={styles.tableCellRight}>
                    <button
                      onClick={() => handleReset(user.id, user.email)}
                      className={styles.tableActionEdit}
                      title="Skicka återställningslänk"
                      aria-label="Återställ lösenord"
                    >
                      <KeyRound size={15} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className={styles.tableActionDelete}
                      title="Radera konto"
                      aria-label="Radera"
                      disabled={users.length <= 1}
                      style={{ opacity: users.length <= 1 ? 0.4 : 1,
                        cursor: users.length <= 1 ? "not-allowed" : "pointer" }}
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className={styles.tableEmpty}>Inga användare hittades</div>
          )}
        </div>

      </main>
    </div>
  );
}