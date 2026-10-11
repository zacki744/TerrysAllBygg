import { useState } from "react";
import { errorMessage } from "../../lib/errors";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import ImageUploader from "./ImageUploader";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import ProjectWritingHelp from "./ProjectWritingHelp";
import { useSettings } from "../../lib/settingsContext";
import { findService, suggestService } from "../../lib/services";
import { hasPlaceholders } from "../../lib/projectText";
import type { UpdateProjectRequest, CreateProjectRequest } from "../../lib/project";
import styles from "../../admin.module.css";
import uiStyles from "../ui/ui.module.css";

interface ProjectFormProps {
  initialData?: UpdateProjectRequest & { id?: string };
  onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ProjectFormProps) {
  const initialImages = [
    ...(initialData?.mainImage ? [initialData.mainImage] : []),
    ...(initialData?.additionalImages || []),
  ];

  const { services } = useSettings();
  const [formData, setFormData] = useState({
    title:       initialData?.title       || "",
    description: initialData?.description || "",
    service:     initialData?.service     || "",
  });

  const [images, setImages] = useState<string[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Vänligen ladda upp minst en bild");
      return;
    }

    if (hasPlaceholders(formData.description)) {
      setError("Byt ut texten inom [hakparenteser] i beskrivningen innan du sparar.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        title:            formData.title,
        description:      formData.description,
        mainImage:        images[0],
        additionalImages: images.slice(1),
        service:          formData.service || null,
      });
    } catch (err) {
      setError(errorMessage(err, "Kunde inte spara projekt"));
    } finally {
      setLoading(false);
    }
  };

  const suggestion = suggestService(services, formData.title, formData.description);
  const initialJson = useState(() => JSON.stringify({ ...formData, images }))[0];
  const dirty = JSON.stringify({ ...formData, images }) !== initialJson;
  const guardLeave = useUnsavedChanges(dirty && !loading);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.formField}>
        <label htmlFor="project-title" className={styles.formLabel}>Titel</label>
        <Input
          id="project-title"
          type="text"
          maxLength={200}
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="t.ex. Utomhusbastu"
          required
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="project-description" className={styles.formLabel}>Beskrivning</label>
        <Textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Beskriv projektet..."
          rows={8}
          maxLength={4000}
          aria-describedby="project-description-help"
          required
        />
        <ProjectWritingHelp
          id="project-description-help"
          service={findService(services, formData.service)}
          description={formData.description}
          onUseTemplate={(text) => handleChange("description", text)}
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="project-service" className={styles.formLabel}>Tjänst</label>
        <div className={uiStyles.selectWrapper}>
        <select
          id="project-service"
          className={uiStyles.select}
          value={formData.service}
          onChange={(e) => handleChange("service", e.target.value)}
          aria-describedby="project-service-hint"
        >
          <option value="">Ingen tjänst</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          {formData.service && !findService(services, formData.service) && (
            <option value={formData.service}>{formData.service} (borttagen tjänst)</option>
          )}
        </select>
          <div className={uiStyles.selectArrow} aria-hidden>
            <svg className={uiStyles.selectArrowIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p id="project-service-hint" className={styles.formHint}>
          Projektet visas som exempel på tjänstens sida och under filtret på projektsidan.
        </p>
        {!formData.service && suggestion && (
          <p className={styles.formHint}>
            Förslag: <button type="button" className={styles.inlineLinkButton}
              onClick={() => handleChange("service", suggestion.slug)}>{suggestion.name}</button>
          </p>
        )}
      </div>

      <div className={styles.card}>
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          label="Projektbilder"
          maxImages={10}
        />
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