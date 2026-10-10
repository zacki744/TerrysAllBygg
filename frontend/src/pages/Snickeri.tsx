import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageGallery from "../components/project/ImageGallery";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import PageMeta from "../components/PageMeta";
import PrivacyNotice from "../components/PrivacyNotice";
import NotFound from "./NotFound";
import { snickeriPath } from "../lib/routes";
import RetryError from "../components/RetryError";
import { useFetch } from "../hooks/useFetch";
import { API, isNotFound, type SnickeriDetail } from "../lib/api";
import { formatPrice } from "../lib/formatPrice";
import styles from "../pages.module.css";

interface InquiryForm {
  name: string;
  email: string;
  phoneNumber: string;
  notes: string;
}

const EMPTY_FORM: InquiryForm = {
  name: "", email: "", phoneNumber: "", notes: "",
};

export default function SnickeriPageContent() {
  const { id } = useParams();

  const { data: snickeri, error, loading, reload } =
    useFetch<SnickeriDetail>(id ? API.snickeri(id) : null);
  const [form, setForm]         = useState<InquiryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snickeri) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/snickerier/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snickeriId:    snickeri.id,
          snickeriTitle: snickeri.title,
          snickeriPrice: snickeri.price,
          ...form,
          privacyAccepted,
        }),
      });
      if (!res.ok) throw new Error("Något gick fel");
      setSubmitted(true);
    } catch {
      setSubmitError("Något gick fel. Vänligen försök igen.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Early returns ───────────────────────────────────────────
  if (!id || isNotFound(error)) return <NotFound />;

  if (loading || !snickeri) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          {error ? <RetryError onRetry={reload} /> : <p className={styles.stateText}>Laddar…</p>}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageMeta
        title={snickeri.title}
        description={snickeri.description}
        canonical={snickeriPath(id, snickeri.title)}
        breadcrumbs={[
          { name: "Snickerier", path: "/snickerier" },
          { name: snickeri.title, path: snickeriPath(id, snickeri.title) },
        ]}
        ogImage={snickeri.images[0]}
        product={{
          name:        snickeri.title,
          description: snickeri.description,
          price:       snickeri.price,
          image:       snickeri.images[0] ?? "",
        }}
      />
      <Navbar />

      <main className={styles.mainWide} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        <header className={styles.snickeriDetailHeader}>
          <h1 className={styles.projectTitle}>{snickeri.title}</h1>
          <p className={styles.snickeriDetailPrice}>{formatPrice(snickeri.price)}</p>
        </header>

        <ImageGallery images={snickeri.images} title={snickeri.title} />

        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Beskrivning</h2>
          <p className={styles.descriptionText}>{snickeri.description}</p>
        </section>

        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Skicka en förfrågan</h2>
          <p className={styles.descriptionText}>
            Intresserad av {snickeri.title}? Fyll i dina uppgifter nedan så
            återkommer vi till dig så snart som möjligt.
          </p>

          {submitted ? (
            <div className={styles.infoBox} style={{ marginTop: "1rem" }}>
              <p className={`${styles.infoBoxTitle} ${styles.iconLine}`}><CircleCheck size={18} aria-hidden /> Förfrågan skickad!</p>
              <p className={styles.infoBoxText}>Tack! Vi hör av oss så snart som möjligt.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.bookForm} style={{ marginTop: "1rem" }}>

              <div className={styles.formField}>
                <label htmlFor="inquiry-name" className={styles.formLabel}>Namn *</label>
                <Input id="inquiry-name" name="name" autoComplete="name" placeholder="Ditt namn" value={form.name} onChange={handleChange} required />
              </div>

              <div className={styles.formField}>
                <label htmlFor="inquiry-email" className={styles.formLabel}>E-post *</label>
                <Input id="inquiry-email" name="email" autoComplete="email" type="email" placeholder="din@email.se" value={form.email} onChange={handleChange} required />
              </div>

              <div className={styles.formField}>
                <label htmlFor="inquiry-phoneNumber" className={styles.formLabel}>Telefonnummer</label>
                <Input id="inquiry-phoneNumber" name="phoneNumber" autoComplete="tel" type="tel" placeholder="070-123 45 67" value={form.phoneNumber} onChange={handleChange} />
              </div>

              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="inquiry-notes" className={styles.formLabel}>Meddelande</label>
                <Textarea
                  id="inquiry-notes" name="notes"
                  rows={4}
                  placeholder="Eventuella frågor eller önskemål om färg, storlek, material..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <PrivacyNotice
                id="snickeri-privacy"
                checked={privacyAccepted}
                onChange={setPrivacyAccepted}
              />

              {submitError && (
                <div className={`${styles.snickeriInquiryError} ${styles.formFieldFull}`}>
                  {submitError}
                </div>
              )}

              <div className={styles.formFieldFull}>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Skickar..." : "Skicka förfrågan"}
                </Button>
              </div>

            </form>
          )}
        </section>

        <div>
          <Link to="/snickerier" className={styles.btnGhost}>← Tillbaka till snickerier</Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}