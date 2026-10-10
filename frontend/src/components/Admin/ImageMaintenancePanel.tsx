// src/components/Admin/ImageMaintenancePanel.tsx
// ── Bildunderhåll: krymper gamla bilder, skapar miniatyrer, flyttar undan oanvända ──
// Backend: GET/POST /api/admin/image/maintenance (ImageController)

import { useState } from "react";
import { ImageDown } from "lucide-react";
import styles from "../../admin.module.css";

interface Report {
  scanned: number;
  remaining: number;
  optimized: number;
  thumbnailsCreated: number;
  movedUnused: number;
  bytesBefore: number;
  bytesAfter: number;
  errors: string[];
  dryRun: boolean;
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

async function call(method: "GET" | "POST"): Promise<Report> {
  const res = await fetch("/api/admin/image/maintenance", { method, credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function ImageMaintenancePanel() {
  const [preview, setPreview] = useState<Report | null>(null);
  const [result, setResult]   = useState<{ optimized: number; thumbs: number; moved: number; saved: number; errors: string[] } | null>(null);
  const [busy, setBusy]       = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError]     = useState("");

  const check = async () => {
    setBusy(true); setError(""); setResult(null);
    try {
      setPreview(await call("GET"));
    } catch {
      setError("Kunde inte kontrollera bilderna.");
    } finally {
      setBusy(false);
    }
  };

  const run = async () => {
    setBusy(true); setError("");
    const total = { optimized: 0, thumbs: 0, moved: 0, saved: 0, errors: [] as string[] };
    try {
      // Backend arbetar i omgångar på ~40 s — fortsätt tills inget återstår
      for (let round = 1; round <= 50; round++) {
        setProgress(`Omgång ${round}…`);
        const r = await call("POST");
        total.optimized += r.optimized;
        total.thumbs    += r.thumbnailsCreated;
        total.moved     += r.movedUnused;
        total.saved     += r.bytesBefore - r.bytesAfter;
        total.errors.push(...r.errors.filter((e) => !total.errors.includes(e)));
        if (r.remaining === 0) break;
        setProgress(`Omgång ${round} klar, ${r.remaining} bilder kvar…`);
      }
      setResult(total);
      setPreview(null);
    } catch {
      setError("Underhållet avbröts. Det som hann göras är sparat — kör igen för att fortsätta.");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const nothingToDo = preview && preview.optimized + preview.thumbnailsCreated + preview.movedUnused === 0;

  return (
    <section className={styles.card} style={{ marginTop: "3rem" }} aria-labelledby="image-maintenance">
      <h2 id="image-maintenance" className={styles.pageTitle} style={{ fontSize: "1.25rem" }}>
        Bildunderhåll
      </h2>
      <p className={styles.pageSubtitle}>
        Krymper stora bilder, skapar små versioner till korten och flyttar undan bilder som
        inget projekt använder (till <code>uploads/projects/.oanvanda</code>, inget raderas).
      </p>

      {preview && (
        <ul style={{ margin: "1rem 0", paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          <li>{preview.scanned} bilder, totalt {mb(preview.bytesBefore)}</li>
          <li>{preview.optimized} behöver krympas</li>
          <li>{preview.thumbnailsCreated} saknar miniatyr</li>
          <li>{preview.movedUnused} används inte av något projekt eller snickeri</li>
        </ul>
      )}

      {result && (
        <p style={{ margin: "1rem 0" }} role="status">
          Klart: {result.optimized} bilder krympta, {result.thumbs} miniatyrer skapade,{" "}
          {result.moved} oanvända flyttade. Sparat {mb(result.saved)}.
        </p>
      )}

      {[...(result?.errors ?? []), ...(preview?.errors ?? [])].length > 0 && (
        <details style={{ margin: "0.5rem 0 1rem" }}>
          <summary>Meddelanden</summary>
          <ul>{[...(result?.errors ?? []), ...(preview?.errors ?? [])].map((e) => <li key={e}>{e}</li>)}</ul>
        </details>
      )}

      {error && <p role="alert" style={{ color: "#b91c1c", margin: "1rem 0" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginTop: "1rem" }}>
        <button type="button" className={styles.btnGhost} onClick={check} disabled={busy}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <ImageDown size={18} aria-hidden />
          <span>Kontrollera bilder</span>
        </button>
        {preview && !nothingToDo && (
          <button type="button" className={styles.addButton} onClick={run} disabled={busy}>
            <span>Kör underhåll</span>
          </button>
        )}
        {nothingToDo && <span>Allt ser bra ut.</span>}
        {progress && <span aria-live="polite">{progress}</span>}
      </div>
    </section>
  );
}
