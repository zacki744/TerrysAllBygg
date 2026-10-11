// src/pages/admin/ServicesAdmin.tsx
// ── Admin → Tjänster ──
// Listan styr tjänstesidorna (/tjanster/…), startsidans "Det här bygger vi",
// Om oss, valen i bokningsformuläret och etiketterna på projekt.
// Sparas i webbplatsinställningarna (services).

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Plus, Trash2 } from "lucide-react";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import { AdminAPI, SettingsAPI } from "../../lib/auth";
import { errorMessage } from "../../lib/errors";
import { confirmAction, notify } from "../../lib/notify";
import { slugify } from "../../lib/routes";
import { mergeSettings, toApiSettings, type SiteSettings } from "../../lib/settings";
import { useSetSettings } from "../../lib/settingsContext";
import { servicePath, validateServices, type Service } from "../../lib/services";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import styles from "../../admin.module.css";

interface Row extends Service {
  key: string;      // stabil nyckel i listan (adressen kan ändras för nya tjänster)
  isNew: boolean;   // adressen kan bara ändras innan tjänsten sparats
}

const DESCRIPTION_MAX = 160;
let keySeq = 0;
const toRow = (s: Service, isNew = false): Row => ({ ...s, key: `k${keySeq++}`, isNew });
const toService = (r: Row): Service => ({
  slug: r.slug, name: r.name, detail: r.detail, title: r.title, description: r.description,
  intro: r.intro, includes: r.includes, goodToKnow: r.goodToKnow,
});

export default function ServicesAdmin() {
  const setSiteSettings = useSetSettings();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [savedJson, setSavedJson] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    SettingsAPI.get()
      .then((api) => {
        const s = mergeSettings(api);
        const r = s.services.map((x) => toRow(x));
        setSettings(s);
        setRows(r);
        setSavedJson(JSON.stringify(r.map(toService)));
      })
      .catch((err) => setLoadError(errorMessage(err, "Kunde inte läsa tjänsterna")));

    AdminAPI.getAllProjects()
      .then((projects) => {
        const c: Record<string, number> = {};
        for (const p of projects) if (p.service) c[p.service] = (c[p.service] ?? 0) + 1;
        setCounts(c);
      })
      .catch(() => { /* antal projekt är bara information */ });
  }, []);

  const dirty = useMemo(() => JSON.stringify(rows.map(toService)) !== savedJson, [rows, savedJson]);
  useUnsavedChanges(dirty && !saving);

  const update = (key: string, patch: Partial<Service>) =>
    setRows((rs) => rs.map((r) => {
      if (r.key !== key) return r;
      const next = { ...r, ...patch };
      // Nya tjänster får adress efter namnet tills någon ändrar adressen själv
      if (r.isNew && patch.name !== undefined && r.slug === slugify(r.name)) next.slug = slugify(patch.name);
      return next;
    }));

  const move = (index: number, to: number) =>
    setRows((rs) => {
      if (to < 0 || to >= rs.length) return rs;
      const next = [...rs];
      const [item] = next.splice(index, 1);
      next.splice(to, 0, item);
      return next;
    });

  const add = () => {
    const row = toRow({ slug: "", name: "", detail: "", title: "", description: "", intro: "", includes: [], goodToKnow: "" }, true);
    setRows((rs) => [...rs, row]);
    setOpen(row.key);
  };

  const remove = async (row: Row) => {
    const n = counts[row.slug] ?? 0;
    const ok = await confirmAction({
      title: `Ta bort "${row.name || "ny tjänst"}"?`,
      message: (row.isNew ? "" : `Sidan /tjanster/${row.slug} försvinner när du sparar. `) +
        (n > 0 ? `${n} projekt har den här etiketten och visas då utan tjänst.` : ""),
      confirmLabel: "Ta bort",
      danger: true,
    });
    if (ok) setRows((rs) => rs.filter((r) => r.key !== row.key));
  };

  const save = async () => {
    if (!settings) return;
    const problem = validateServices(rows);
    if (problem) { notify.error(problem); return; }

    setSaving(true);
    try {
      const services = rows.map(toService).map((s) => ({
        ...s,
        title: s.title.trim() || s.name,
        includes: s.includes.map((i) => i.trim()).filter(Boolean),
      }));
      const result = mergeSettings(await SettingsAPI.save(toApiSettings({ ...settings, services })));
      const r = result.services.map((x) => toRow(x));
      setSettings(result);
      setRows(r);
      setSavedJson(JSON.stringify(r.map(toService)));
      setSiteSettings(result);
      notify.success("Tjänsterna är sparade och syns direkt på sajten.");
    } catch (err) {
      notify.error(errorMessage(err, "Kunde inte spara tjänsterna"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <AdminNavbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Tjänster</h1>
            <p className={styles.pageSubtitle}>
              Det här visas på tjänstesidorna, på startsidan, i Om oss och i bokningsformuläret.
              Projekt kopplas till en tjänst i projektformuläret.
            </p>
          </div>
        </div>

        {loadError && <div className={styles.errorBox} role="alert">{loadError}</div>}
        {!settings && !loadError && <p className={styles.loadingText}>Laddar…</p>}

        {settings && (
          <>
            <ol className={styles.serviceAdminList}>
              {rows.map((row, i) => {
                const isOpen = open === row.key;
                const n = counts[row.slug] ?? 0;
                const id = `svc-${row.key}`;
                return (
                  <li key={row.key} className={styles.serviceAdminItem}>
                    <div className={styles.serviceAdminHead}>
                      <button type="button" className={styles.serviceAdminToggle}
                        aria-expanded={isOpen} aria-controls={`${id}-body`}
                        onClick={() => setOpen(isOpen ? null : row.key)}>
                        <ChevronDown size={18} aria-hidden className={isOpen ? styles.chevronOpen : undefined} />
                        <span>
                          <strong>{row.name || "Ny tjänst"}</strong>
                          <span className={styles.serviceAdminMeta}>
                            /tjanster/{row.slug || "…"} · {n === 1 ? "1 projekt" : `${n} projekt`}
                            {row.isNew && " · inte sparad"}
                          </span>
                        </span>
                      </button>
                      <div className={styles.serviceAdminActions}>
                        <button type="button" className={styles.tileBtn} aria-label={`Flytta ${row.name} uppåt`}
                          aria-disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp size={16} aria-hidden /></button>
                        <button type="button" className={styles.tileBtn} aria-label={`Flytta ${row.name} nedåt`}
                          aria-disabled={i === rows.length - 1} onClick={() => move(i, i + 1)}><ArrowDown size={16} aria-hidden /></button>
                        <button type="button" className={`${styles.tileBtn} ${styles.tileBtnDanger}`}
                          aria-label={`Ta bort ${row.name || "ny tjänst"}`} onClick={() => remove(row)}><Trash2 size={16} aria-hidden /></button>
                      </div>
                    </div>

                    {isOpen && (
                      <div id={`${id}-body`} className={styles.serviceAdminBody}>
                        <div className={styles.twoCols}>
                          <div className={styles.formField}>
                            <label htmlFor={`${id}-name`} className={styles.formLabel}>Namn</label>
                            <Input id={`${id}-name`} value={row.name} maxLength={50}
                              onChange={(e) => update(row.key, { name: e.target.value })} />
                            <p className={styles.formHint}>Visas i menyer, listor och bokningsformuläret, t.ex. "Altaner".</p>
                          </div>
                          <div className={styles.formField}>
                            <label htmlFor={`${id}-detail`} className={styles.formLabel}>Komplettering i listor</label>
                            <Input id={`${id}-detail`} value={row.detail} maxLength={100} placeholder="och uteplatser"
                              onChange={(e) => update(row.key, { detail: e.target.value })} />
                            <p className={styles.formHint}>Står efter namnet: "Altaner <em>och uteplatser</em>".</p>
                          </div>
                        </div>

                        <div className={styles.formField}>
                          <label htmlFor={`${id}-slug`} className={styles.formLabel}>Adress</label>
                          {row.isNew ? (
                            <Input id={`${id}-slug`} value={row.slug} maxLength={60}
                              onChange={(e) => update(row.key, { slug: slugify(e.target.value) })} />
                          ) : (
                            <p className={styles.slugLocked}>
                              <a href={servicePath(row.slug)} target="_blank" rel="noopener noreferrer">
                                terrysallbygg.se{servicePath(row.slug)} <ExternalLink size={14} aria-hidden />
                              </a>
                            </p>
                          )}
                          <p className={styles.formHint}>
                            {row.isNew
                              ? "Skapas från namnet. Kan inte ändras efter att tjänsten sparats, eftersom länkar och Google pekar hit."
                              : "Adressen ändras inte, eftersom länkar och Google pekar hit."}
                          </p>
                        </div>

                        <div className={styles.formField}>
                          <label htmlFor={`${id}-title`} className={styles.formLabel}>Rubrik på sidan</label>
                          <Input id={`${id}-title`} value={row.title} maxLength={120} placeholder={row.name}
                            onChange={(e) => update(row.key, { title: e.target.value })} />
                        </div>

                        <div className={styles.formField}>
                          <label htmlFor={`${id}-desc`} className={styles.formLabel}>Text i Googles sökresultat</label>
                          <Textarea id={`${id}-desc`} rows={2} value={row.description} maxLength={170}
                            onChange={(e) => update(row.key, { description: e.target.value })} />
                          <p className={styles.formHint}>
                            {row.description.length}/{DESCRIPTION_MAX} tecken. En mening om vad ni gör och var – t.ex. "Altaner och trädäck på Österlen …".
                          </p>
                        </div>

                        <div className={styles.formField}>
                          <label htmlFor={`${id}-intro`} className={styles.formLabel}>Inledning</label>
                          <Textarea id={`${id}-intro`} rows={6} value={row.intro} maxLength={3000}
                            onChange={(e) => update(row.key, { intro: e.target.value })} />
                          <p className={styles.formHint}>Tom rad = nytt stycke. Första stycket visas också på sidan Tjänster.</p>
                        </div>

                        <div className={styles.formField}>
                          <label htmlFor={`${id}-includes`} className={styles.formLabel}>Det här kan vi hjälpa till med</label>
                          <Textarea id={`${id}-includes`} rows={6} value={row.includes.join("\n")}
                            onChange={(e) => update(row.key, { includes: e.target.value.split("\n") })} />
                          <p className={styles.formHint}>En punkt per rad.</p>
                        </div>

                        <div className={styles.formField}>
                          <label htmlFor={`${id}-good`} className={styles.formLabel}>Bra att veta</label>
                          <Textarea id={`${id}-good`} rows={4} value={row.goodToKnow} maxLength={1500}
                            onChange={(e) => update(row.key, { goodToKnow: e.target.value })} />
                          <p className={styles.formHint}>T.ex. bygglov, ROT-avdrag eller vad kunden bör tänka på. Lämna tomt för att dölja rutan.</p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <button type="button" className={styles.btnGhost} onClick={add} style={{ marginTop: "1rem" }}>
              <Plus size={16} aria-hidden /> Lägg till tjänst
            </button>

            <div className={styles.saveBar}>
              <div className={styles.saveBarButtons}>
                <button type="button" className={styles.btnGhost} disabled={!dirty || saving}
                  onClick={() => { const s = settings.services.map((x) => toRow(x)); setRows(s); setOpen(null); }}>
                  Ångra ändringar
                </button>
                <button type="button" className={styles.addButton} disabled={!dirty || saving} onClick={save}>
                  {saving ? "Sparar…" : "Spara"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
