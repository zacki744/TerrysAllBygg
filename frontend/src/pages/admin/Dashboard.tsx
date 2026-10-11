import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./../../components/Admin/AdminNavbar";
import ProjectTable from "./../../components/Admin/ProjectTable";
import SnickeriTable from "./../../components/Admin/SnickeriTable";
import ImageMaintenancePanel from "./../../components/Admin/ImageMaintenancePanel";
import PageMeta from "../../components/PageMeta";
import { AuthService, AdminAPI, type Project } from "../../lib/auth";
import { confirmAction, notify } from "../../lib/notify";
import { errorMessage } from "../../lib/errors";
import styles from "./../../admin.module.css";

interface SnickeriItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

async function fetchSnickerier(): Promise<SnickeriItem[]> {
  const res = await fetch("/api/admin/snickerier", { credentials: "include" });
  if (!res.ok) throw new Error("Kunde inte läsa snickerierna");
  return res.json();
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects]     = useState<Project[]>([]);
  const [snickerier, setSnickerier] = useState<SnickeriItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState("");
  const [attempt, setAttempt]       = useState(0);   // ökas av "Försök igen"

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }

    // Utgången inloggning (401) skickas till inloggningen av adminFetch.
    // Andra fel (nätverk, server) visas här i stället för att logga ut.
    const loadAll = async () => {
      setLoadError("");
      try {
        const [projectData, snickeriData] = await Promise.all([
          AdminAPI.getAllProjects(),
          fetchSnickerier(),
        ]);
        setProjects(projectData);
        setSnickerier(snickeriData);
      } catch (err) {
        setLoadError(errorMessage(err, "Kunde inte läsa projekt och snickerier"));
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [navigate, attempt]);

  const handleEditProject  = (id: string) => navigate(`/admin/projects/edit?id=${id}`);
  const handleEditSnickeri = (id: string) => navigate(`/admin/snickerier/edit?id=${id}`);

  const handleDeleteProject = async (id: string, title: string) => {
    const ok = await confirmAction({
      title: `Radera "${title}"?`,
      message: "Projektet försvinner från sajten. Det går inte att ångra.",
      confirmLabel: "Radera projektet",
      danger: true,
    });
    if (!ok) return;
    try {
      await AdminAPI.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      notify.success(`"${title}" är raderat`);
    } catch {
      notify.error("Kunde inte radera projektet. Försök igen.");
    }
  };

  const handleDeleteSnickeri = async (id: string, title: string) => {
    const ok = await confirmAction({
      title: `Radera "${title}"?`,
      message: "Snickeriet försvinner från sajten. Det går inte att ångra.",
      confirmLabel: "Radera snickeriet",
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/snickerier/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error();
      setSnickerier((prev) => prev.filter((s) => s.id !== id));
      notify.success(`"${title}" är raderat`);
    } catch {
      notify.error("Kunde inte radera snickeriet. Försök igen.");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <AdminNavbar />
        <main className={styles.main}>
          <p className={styles.loadingText}>Laddar…</p>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <AdminNavbar />
        <main className={styles.main}>
          <div className={styles.errorBox} role="alert">
            {loadError}.{" "}
            <button type="button" className={styles.inlineLinkButton}
              onClick={() => { setLoading(true); setAttempt((n) => n + 1); }}>
              Försök igen
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageMeta title="Admin" noIndex={true} />
      <AdminNavbar />
      <main className={styles.main}>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Projekt</h1>
            <p className={styles.pageSubtitle}>Hantera dina byggprojekt</p>
          </div>
          <button className={styles.addButton}
            onClick={() => navigate("/admin/projects/new")}>
            <Plus size={18} strokeWidth={2} />
            <span>Nytt projekt</span>
          </button>
        </div>

        <ProjectTable projects={projects}
          onEdit={handleEditProject} onDelete={handleDeleteProject} />

        <div className={styles.pageHeader} style={{ marginTop: "3rem" }}>
          <div>
            <h1 className={styles.pageTitle}>Snickerier</h1>
            <p className={styles.pageSubtitle}>Hantera dina färdiga snickerier</p>
          </div>
          <button className={styles.addButton}
            onClick={() => navigate("/admin/snickerier/new")}>
            <Plus size={18} strokeWidth={2} />
            <span>Nytt snickeri</span>
          </button>
        </div>

        <SnickeriTable items={snickerier}
          onEdit={handleEditSnickeri} onDelete={handleDeleteSnickeri} />

        <ImageMaintenancePanel />

      </main>
    </div>
  );
}