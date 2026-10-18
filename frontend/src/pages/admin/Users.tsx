import { useEffect, useState } from "react";
import { errorMessage } from "../../lib/errors";
import { useNavigate } from "react-router-dom";
import { Mail, Trash2, KeyRound } from "lucide-react";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import { AdminAPI } from "../../lib/adminApi";
import type { AdminUser } from "../../lib/types";
import { confirmAction } from "../../lib/notify";
import styles from "../../admin.module.css";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [loading, setLoading]   = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [message, setMessage]   = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    load();
  }, [navigate]);

  const load = async () => {
    try {
      setUsers(await AdminAPI.users.list());
    } catch (err) {
      setMessage({ text: errorMessage(err, "Kunde inte läsa användarna"), ok: false });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setMessage(null);
    try {
      const data = await AdminAPI.users.invite(inviteEmail);
      setMessage({ text: data.message, ok: true });
      setInviteEmail("");
    } catch (err) {
      setMessage({ text: errorMessage(err, "Kunde inte skicka inbjudan"), ok: false });
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    const ok = await confirmAction({
      title: `Radera kontot ${email}?`,
      message: "Personen loggas ut direkt och kan inte längre logga in i admin.",
      confirmLabel: "Radera kontot",
      danger: true,
    });
    if (!ok) return;
    try {
      await AdminAPI.users.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMessage({ text: "Konto raderat", ok: true });
    } catch (err) {
      setMessage({ text: errorMessage(err, "Kunde inte radera konto"), ok: false });
    }
  };

  const handleReset = async (id: string, email: string) => {
    const ok = await confirmAction({
      title: "Skicka återställningslänk?",
      message: `${email} får ett mejl med en länk för att välja nytt lösenord. Länken gäller i 2 timmar.`,
      confirmLabel: "Skicka länk",
    });
    if (!ok) return;
    try {
      const data = await AdminAPI.users.sendReset(id);
      setMessage({ text: data.message, ok: true });
    } catch (err) {
      setMessage({ text: errorMessage(err, "Kunde inte skicka länk"), ok: false });
    }
  };

  if (loading) {
    return (
      <div className={styles.pageCenter}>
        <p className={styles.loadingText}>Laddar…</p>
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