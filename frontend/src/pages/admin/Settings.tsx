// src/pages/admin/Settings.tsx
// ── Admin → Inställningar ──
// Det Terry ska kunna ändra själv utan ny deploy: startsidans bild och texter,
// förtroenderaden, omdömen, adress och sociala medier samt Om oss-texten.

import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, ExternalLink } from "lucide-react";
import AdminNavbar from "../../components/Admin/AdminNavbar";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import { SettingsAPI } from "../../lib/auth";
import { errorMessage } from "../../lib/errors";
import {
  mergeSettings, toApiSettings,
  type HeroFocus, type SiteSettings,
} from "../../lib/settings";
import { useSetSettings } from "../../lib/settingsContext";
import defaultHeroImage from "../../assets/hero.webp";
import styles from "../../admin.module.css";

type Message = { text: string; ok: boolean } | null;

const FOCUS_OPTIONS: { value: HeroFocus; label: string }[] = [
  { value: "left",   label: "Vänster" },
  { value: "center", label: "Mitten" },
  { value: "right",  label: "Höger" },
];
const FOCUS_CSS: Record<HeroFocus, string> = { left: "25% 50%", center: "50% 50%", right: "75% 50%" };

export default function AdminSettingsPage() {
  const setSiteSettings = useSetSettings();
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm]       = useState<SiteSettings | null>(null);
  const [saved, setSaved]     = useState<SiteSettings | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    SettingsAPI.get()
      .then((api) => { const s = mergeSettings(api); setForm(s); setSaved(s); })
      .catch((err) => setLoadError(errorMessage(err, "Kunde inte läsa inställningarna")));
  }, []);

  const dirty = !!form && JSON.stringify(form) !== JSON.stringify(saved);

  // Varna innan sidan lämnas med osparade ändringar
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const img = await SettingsAPI.uploadHeroImage(file);
      setForm((f) => f && ({ ...f, heroImage: img.path, heroImageWidth: img.width, heroImageHeight: img.height }));
      setMessage({ text: "Bilden är uppladdad. Klicka på Spara för att använda den på sajten.", ok: true });
    } catch (err) {
      setMessage({ text: errorMessage(err, "Bilden kunde inte laddas upp"), ok: false });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage(null);
    try {
      // Omdömen kan inte visas utan länk (servern gör samma kontroll)
      const toSave = { ...form, showReviews: form.showReviews && !!form.googleReviewsUrl.trim() };
      const result = mergeSettings(await SettingsAPI.save(toApiSettings(toSave)));
      setForm(result);
      setSaved(result);
      setSiteSettings(result);   // syns direkt när man klickar "Visa sida"
      setMessage({ text: "Sparat! Ändringarna syns direkt på sajten.", ok: true });
    } catch (err) {
      setMessage({ text: errorMessage(err, "Kunde inte spara"), ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div className={styles.page}>
        <AdminNavbar />
        <main className={styles.main}>
          {loadError
            ? <div className={styles.errorBox}>{loadError}</div>
            : <p className={styles.loadingText}>Laddar inställningar…</p>}
        </main>
      </div>
    );
  }

  const heroSrc = form.heroImage ?? defaultHeroImage;

  return (
    <div className={styles.page}>
      <AdminNavbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Inställningar</h1>
            <p className={styles.pageSubtitle}>Det som visas på sajten utöver projekt och snickerier</p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
            <ExternalLink size={16} aria-hidden /> Visa sajten
          </a>
        </div>

        <form onSubmit={handleSubmit} className={styles.settingsForm}>

          {/* ── Startsidan ── */}
          <fieldset className={`${styles.card} ${styles.settingsSection}`}>
            <legend className={styles.settingsLegend}>Startsidan</legend>

            <div className={styles.heroPreview}>
              <img
                src={heroSrc}
                alt=""
                style={form.heroImage ? { objectPosition: FOCUS_CSS[form.heroImageFocus] } : undefined}
              />
              <span className={styles.heroPreviewBadge}>{form.heroImage ? "Egen bild" : "Standardbild"}</span>
            </div>

            <div className={styles.settingsRow}>
              <label className={`${styles.addButton} ${styles.uploadLabel}`} aria-disabled={uploading}>
                <ImagePlus size={16} aria-hidden />
                {uploading ? "Laddar upp…" : "Byt bild"}
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*,.heic,.heif,.hif"
                  className={styles.visuallyHidden}
                  disabled={uploading}
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
              </label>
              {form.heroImage && (
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => setForm({ ...form, heroImage: null, heroImageWidth: null, heroImageHeight: null })}
                >
                  <RotateCcw size={16} aria-hidden /> Använd standardbilden
                </button>
              )}
            </div>
            <p className={styles.formHint}>
              Liggande foto, gärna minst 1920 px brett. Bilden förminskas och sparas i två storlekar automatiskt.
            </p>

            {form.heroImage && (
              <div className={styles.formField}>
                <span className={styles.formLabel} id="focus-label">Vilken del av bilden ska synas?</span>
                <div className={styles.segmented} role="radiogroup" aria-labelledby="focus-label">
                  {FOCUS_OPTIONS.map((o) => (
                    <label key={o.value} className={form.heroImageFocus === o.value ? styles.segmentActive : styles.segment}>
                      <input
                        type="radio"
                        name="heroImageFocus"
                        value={o.value}
                        checked={form.heroImageFocus === o.value}
                        onChange={() => set("heroImageFocus", o.value)}
                        className={styles.visuallyHidden}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
                <p className={styles.formHint}>På dator står texten till höger, så motivet bör synas till vänster.</p>
              </div>
            )}

            <div className={styles.formField}>
              <label htmlFor="heroImageAlt" className={styles.formLabel}>Bildbeskrivning</label>
              <Input id="heroImageAlt" value={form.heroImageAlt} maxLength={200}
                onChange={(e) => set("heroImageAlt", e.target.value)} />
              <p className={styles.formHint}>Läses upp för synskadade och används av Google. Beskriv vad som syns.</p>
            </div>

            <div className={styles.formField}>
              <label htmlFor="heroTitle" className={styles.formLabel}>Rubrik</label>
              <Input id="heroTitle" value={form.heroTitle} maxLength={120}
                onChange={(e) => set("heroTitle", e.target.value)} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="heroLead" className={styles.formLabel}>Text under rubriken</label>
              <Textarea id="heroLead" rows={4} value={form.heroLead} maxLength={400}
                onChange={(e) => set("heroLead", e.target.value)} />
              <p className={styles.formHint}>{form.heroLead.length}/400 tecken. Tomt fält = standardtexten.</p>
            </div>
          </fieldset>

          {/* ── Förtroenderaden ── */}
          <fieldset className={`${styles.card} ${styles.settingsSection}`}>
            <legend className={styles.settingsLegend}>Förtroenderaden</legend>
            <p className={styles.formHint} style={{ marginTop: 0 }}>
              Visas under bilden på startsidan. Kryssa bara i det som stämmer – felaktiga
              påståenden i marknadsföring är inte tillåtna.
            </p>
            <Checkbox id="trustRot" label="ROT-avdrag direkt på fakturan"
              checked={form.trustRot} onChange={(v) => set("trustRot", v)} />
            <Checkbox id="trustFTax" label="Godkänd för F-skatt"
              checked={form.trustFTax} onChange={(v) => set("trustFTax", v)} />
            <Checkbox id="trustInsured" label="Ansvarsförsäkrad"
              checked={form.trustInsured} onChange={(v) => set("trustInsured", v)} />
          </fieldset>

          {/* ── Omdömen ── */}
          <fieldset className={`${styles.card} ${styles.settingsSection}`}>
            <legend className={styles.settingsLegend}>Omdömen</legend>
            <div className={styles.formField}>
              <label htmlFor="googleReviewsUrl" className={styles.formLabel}>Länk till omdömena på Google</label>
              <Input id="googleReviewsUrl" type="url" placeholder="https://g.page/r/…" value={form.googleReviewsUrl}
                maxLength={300} onChange={(e) => set("googleReviewsUrl", e.target.value)} />
              <p className={styles.formHint}>
                Finns i Google-företagsprofilen under "Be om omdömen". Länken används även av Google för att koppla ihop sajten och profilen.
              </p>
            </div>
            <Checkbox
              id="showReviews"
              label="Visa omdömen på sajten"
              hint={form.googleReviewsUrl
                ? "Visar en ruta på startsidan och en länk i sidfoten. Slå på när de första omdömena finns."
                : "Fyll i länken först."}
              checked={form.showReviews && !!form.googleReviewsUrl}
              disabled={!form.googleReviewsUrl}
              onChange={(v) => set("showReviews", v)}
            />
          </fieldset>

          {/* ── Kontakt ── */}
          <fieldset className={`${styles.card} ${styles.settingsSection}`}>
            <legend className={styles.settingsLegend}>Adress och sociala medier</legend>
            <div className={styles.formField}>
              <label htmlFor="address" className={styles.formLabel}>Adress</label>
              <Input id="address" placeholder="Gatuadress, postnummer ort" value={form.address}
                maxLength={200} onChange={(e) => set("address", e.target.value)} />
              <p className={styles.formHint}>
                Skriv den exakt som i Google-profilen. Visas i sidfoten och integritetspolicyn och hjälper Google att visa er i lokala sökningar.
              </p>
            </div>
            <div className={styles.formField}>
              <label htmlFor="facebook" className={styles.formLabel}>Facebook</label>
              <Input id="facebook" type="url" placeholder="https://facebook.com/…" value={form.facebook}
                maxLength={300} onChange={(e) => set("facebook", e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label htmlFor="instagram" className={styles.formLabel}>Instagram</label>
              <Input id="instagram" type="url" placeholder="https://instagram.com/…" value={form.instagram}
                maxLength={300} onChange={(e) => set("instagram", e.target.value)} />
            </div>
            <p className={styles.formHint}>Telefon och e-post ändras i koden (de används även i mejlen).</p>
          </fieldset>

          {/* ── Om oss ── */}
          <fieldset className={`${styles.card} ${styles.settingsSection}`}>
            <legend className={styles.settingsLegend}>Om oss</legend>
            <div className={styles.formField}>
              <label htmlFor="aboutStory" className={styles.formLabel}>Vår historia</label>
              <Textarea id="aboutStory" rows={10} value={form.aboutStory} maxLength={4000}
                onChange={(e) => set("aboutStory", e.target.value)} />
              <p className={styles.formHint}>En tom rad blir ett nytt stycke. Tomt fält = standardtexten.</p>
            </div>
          </fieldset>

          {/* ── Spara ── */}
          <div className={styles.saveBar}>
            {message && (
              <div role="status" className={message.ok ? styles.successBox : styles.errorBox}>{message.text}</div>
            )}
            <div className={styles.saveBarButtons}>
              <button type="button" className={styles.btnGhost} disabled={!dirty || saving}
                onClick={() => { setForm(saved); setMessage(null); }}>
                Ångra ändringar
              </button>
              <button type="submit" className={styles.addButton} disabled={!dirty || saving || uploading}>
                {saving ? "Sparar…" : "Spara"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function Checkbox({ id, label, hint, checked, disabled, onChange }: {
  id: string; label: string; hint?: string; checked: boolean; disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={styles.checkRow}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} aria-describedby={hint ? `${id}-hint` : undefined} />
      <div>
        <label htmlFor={id} className={styles.checkLabel}>{label}</label>
        {hint && <p id={`${id}-hint`} className={styles.formHint}>{hint}</p>}
      </div>
    </div>
  );
}
