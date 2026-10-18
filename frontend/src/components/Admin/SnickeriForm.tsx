import { useState } from "react";
import { errorMessage } from "../../lib/errors";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";
import ImageUploader from "./ImageUploader";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import type { SnickeriInput } from "../../lib/types";
import styles from "../../admin.module.css";

interface SnickeriFormProps {
  initialData?: SnickeriInput;
  onSubmit: (data: SnickeriInput) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function SnickeriForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: SnickeriFormProps) {
  const initialImages = [
    ...(initialData?.mainImage ? [initialData.mainImage] : []),
    ...(initialData?.additionalImages || []),
  ];

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
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

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Ange ett giltigt pris");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        price: parsedPrice,
        mainImage: images[0],
        additionalImages: images.slice(1),
      });
    } catch (err) {
      setError(errorMessage(err, "Kunde inte spara snickeri"));
    } finally {
      setLoading(false);
    }
  };

  const initialJson = useState(() => JSON.stringify({ ...formData, images }))[0];
  const dirty = JSON.stringify({ ...formData, images }) !== initialJson;
  const guardLeave = useUnsavedChanges(dirty && !loading);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.formField}>
        <label htmlFor="snickeri-title" className={styles.formLabel}>Titel</label>
        <Input
          id="snickeri-title"
          type="text"
          maxLength={200}
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="t.ex. Ek-stol med svarvade ben"
          required
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="snickeri-description" className={styles.formLabel}>Beskrivning</label>
        <Textarea
          id="snickeri-description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Beskriv snickeriet: material, mått, ytbehandling…"
          rows={5}
          required
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="snickeri-price" className={styles.formLabel}>Pris (kr)</label>
        <Input
          id="snickeri-price"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
          placeholder="t.ex. 4500"
          required
        />
        <p className={styles.formHint}>
          Pris i kronor <strong>inklusive moms</strong> – priser till privatpersoner ska enligt
          prisinformationslagen anges med moms.
        </p>
      </div>

      <div className={styles.card}>
        <ImageUploader
          images={images}
          onImagesChange={setImages}
          label="Bilder"
          maxImages={10}
        />
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      <div className={styles.formActions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Sparar…" : isEdit ? "Spara ändringar" : "Skapa snickeri"}
        </Button>
        <button type="button" onClick={() => guardLeave(onCancel)} className={styles.btnGhost}>
          Avbryt
        </button>
      </div>

    </form>
  );
}
