import { useState } from "react";
import { errorMessage } from "../../lib/errors";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import ImageUploader from "./ImageUploader";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import ProjectWritingHelp from "./ProjectWritingHelp";
import { useSettings } from "../../lib/settingsContext";
import { findCategory, suggestCategory } from "../../lib/categories";
import { hasPlaceholders } from "../../lib/projectText";
import type { ProjectDetail, ProjectInput } from "../../lib/types";
import styles from "../../admin.module.css";
import uiStyles from "../ui/ui.module.css";

interface ProjectFormProps {
  initialData?: ProjectDetail;
  onSubmit: (data: ProjectInput) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const YEAR_MIN = 1950;
const YEAR_MAX = new Date().getFullYear() + 1;

export default function ProjectForm({ initialData, onSubmit, onCancel, isEdit = false }: ProjectFormProps) {
  const { categories } = useSettings();

  // Allt som strängar i formuläret; omvandlas när det skickas
  const [formData, setFormData] = useState({
    title:       initialData?.title ?? "",
    description: initialData?.description ?? "",
    category:    initialData?.category ?? "",
    location:    initialData?.location ?? "",
    year:        initialData?.year ? String(initialData.year) : "",
    scope:       initialData?.scope ?? "",
  });
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialJson = useState(() => JSON.stringify({ ...formData, images }))[0];
  const dirty = JSON.stringify({ ...formData, images }) !== initialJson;
  const guardLeave = useUnsavedChanges(dirty && !loading);

  const suggestion = suggestCategory(categories, formData.title, formData.description);
  const handleChange = (field: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Ladda upp minst en bild.");
      return;
    }
    if (hasPlaceholders(formData.description)) {
      setError("Byt ut texten inom [hakparenteser] i beskrivningen innan du sparar.");
      return;
    }
    const year = formData.year.trim() ? Number(formData.year) : null;
    if (year !== null && (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX)) {
      setError(`Ange året med fyra siffror, t.ex. ${YEAR_MAX - 1}.`);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await onSubmit({
        title:            formData.title.trim(),
        description:      formData.description.trim(),
        mainImage:        images[0],
        additionalImages: images.slice(1),
        category:         formData.category || null,
        location:         formData.location.trim() || null,
        year,
        scope:            formData.scope.trim() || null,
      });
    } catch (err) {
      setError(errorMessage(err, "Kunde inte spara projektet"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.formField}>
        <label htmlFor="project-title" className={styles.formLabel}>Titel</label>
        <Input id="project-title" type="text" maxLength={200} required
          value={formData.title} onChange={(e) => handleChange("title", e.target.value)}
          placeholder="t.ex. Altan med pergola" />
      </div>

      <div className={styles.formField}>
        <label htmlFor="project-description" className={styles.formLabel}>Beskrivning</label>
        <Textarea id="project-description" rows={8} maxLength={4000} required
          value={formData.description} onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Berätta om projektet…" aria-describedby="project-description-help" />
        <ProjectWritingHelp
          id="project-description-help"
          category={findCategory(categories, formData.category)}
          location={formData.location}
          description={formData.description}
          onUseTemplate={(text) => handleChange("description", text)}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="project-category" className={styles.formLabel}>Kategori</label>
        <div className={uiStyles.selectWrapper}>
          <select id="project-category" className={uiStyles.select} aria-describedby="project-category-hint"
            value={formData.category} onChange={(e) => handleChange("category", e.target.value)}>
            <option value="">Ingen kategori</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            {formData.category && !findCategory(categories, formData.category) && (
              <option value={formData.category}>{formData.category} (borttagen kategori)</option>
            )}
          </select>
          <div className={uiStyles.selectArrow} aria-hidden>
            <svg className={uiStyles.selectArrowIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p id="project-category-hint" className={styles.formHint}>
          Används för filtret på projektsidan. Kategorierna ändras under Inställningar.
        </p>
        {!formData.category && suggestion && (
          <p className={styles.formHint}>
            Förslag: <button type="button" className={styles.inlineLinkButton}
              onClick={() => handleChange("category", suggestion.slug)}>{suggestion.name}</button>
          </p>
        )}
      </div>

      {/* Valfria fakta — visas som en rad under rubriken på projektsidan */}
      <fieldset className={styles.factsFieldset}>
        <legend className={styles.formLabel}>Fakta om projektet <span className={styles.optional}>(valfritt)</span></legend>
        <p className={styles.formHint} style={{ marginTop: 0 }}>
          Fyll i det som passar. Tomma fält visas inte på sajten.
        </p>
        <div className={styles.factsGrid}>
          <div className={styles.formField}>
            <label htmlFor="project-location" className={styles.formLabel}>Ort</label>
            <Input id="project-location" maxLength={100} placeholder="t.ex. Kivik"
              value={formData.location} onChange={(e) => handleChange("location", e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="project-year" className={styles.formLabel}>År</label>
            <Input id="project-year" inputMode="numeric" maxLength={4} placeholder={String(YEAR_MAX - 1)}
              value={formData.year} onChange={(e) => handleChange("year", e.target.value.replace(/\D/g, ""))} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="project-scope" className={styles.formLabel}>Omfattning</label>
            <Input id="project-scope" maxLength={100} placeholder="t.ex. 6 veckor, ca 40 m²"
              value={formData.scope} onChange={(e) => handleChange("scope", e.target.value)} />
          </div>
        </div>
      </fieldset>

      <div className={styles.card}>
        <ImageUploader images={images} onImagesChange={setImages} label="Projektbilder" maxImages={10} />
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      <div className={styles.formActions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Sparar…" : isEdit ? "Spara ändringar" : "Skapa projekt"}
        </Button>
        <button type="button" onClick={() => guardLeave(onCancel)} className={styles.btnGhost}>
          Avbryt
        </button>
      </div>

    </form>
  );
}
