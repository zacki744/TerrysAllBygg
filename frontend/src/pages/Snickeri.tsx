import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageGallery from "../components/project/ImageGallery";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import PageMeta from "../components/PageMeta";
import { formatPrice } from "../lib/formatPrice";
import styles from "../pages.module.css";

interface Snickeri {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
}

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
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [snickeri, setSnickeri] = useState<Snickeri | null>(null);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState<InquiryForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/snickerier/details/${id}`)
      .then((res) => { if (!res.ok) throw new Error("Not found"); return res.json(); })
      .then(setSnickeri)
      .catch(() => setSnickeri(null))
      .finally(() => setLoading(false));
  }, [id]);

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
  if (!id || loading || !snickeri) {
    const msg = !id ? "Inget snickeri valt." : loading ? "Laddar…" : "Snickeriet hittades inte.";
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>{msg}</p>
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
        canonical="/snickeri"
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
              <p className={styles.infoBoxTitle}>✓ Förfrågan skickad!</p>
              <p className={styles.infoBoxText}>Tack! Vi hör av oss så snart som möjligt.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.bookForm} style={{ marginTop: "1rem" }}>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Namn *</label>
                <Input name="name" placeholder="Ditt namn" value={form.name} onChange={handleChange} required />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>E-post *</label>
                <Input name="email" type="email" placeholder="din@email.se" value={form.email} onChange={handleChange} required />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Telefonnummer</label>
                <Input name="phoneNumber" type="tel" placeholder="070-123 45 67" value={form.phoneNumber} onChange={handleChange} />
              </div>

              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>Meddelande</label>
                <Textarea
                  name="notes"
                  rows={4}
                  placeholder="Eventuella frågor eller önskemål om färg, storlek, material..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

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