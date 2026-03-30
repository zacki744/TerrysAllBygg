"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ImageGallery from "@/app/components/project/ImageGallery";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Button from "@/app/components/ui/Button";
import styles from "../../pages.module.css";
import Link from "next/link";

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

export default function SnickeriPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [snickeri, setSnickeri] = useState<Snickeri | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<InquiryForm>({
    name: "",
    email: "",
    phoneNumber: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/snickerier/details/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setSnickeri)
      .catch((err) => {
        console.error(err);
        setSnickeri(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          snickeriId: snickeri.id,
          snickeriTitle: snickeri.title,
          snickeriPrice: snickeri.price,
          ...form,
        }),
      });

      if (!res.ok) throw new Error("Något gick fel");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitError("Något gick fel. Vänligen försök igen.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── States ─────────────────────────────────────────────────

  if (!id) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>Inget snickeri valt.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>Laddar…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!snickeri) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.mainWide}>
          <p className={styles.stateText}>Snuckeriet hittades inte.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Detail view ────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <Navbar />

      <main
        className={styles.mainWide}
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        {/* Header — title + price side by side */}
        <header className={styles.snickeriDetailHeader}>
          <div>
            <h1 className={styles.projectTitle}>{snickeri.title}</h1>
          </div>
          <div className={styles.snickeriDetailPrice}>
            {snickeri.price.toLocaleString("sv-SE")} kr
          </div>
        </header>

        {/* Gallery */}
        <ImageGallery images={snickeri.images} title={snickeri.title} />

        {/* Description */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Beskrivning</h2>
          <p className={styles.descriptionText}>{snickeri.description}</p>
        </section>

        {/* Inquiry form */}
        <section className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Skicka en förfrågan</h2>
          <p className={styles.descriptionText}>
            Intresserad av {snickeri.title}? Fyll i dina uppgifter nedan så
            återkommer vi till dig så snart som möjligt.
          </p>

          {submitted ? (
            <div className={styles.infoBox} style={{ marginTop: "1rem" }}>
              <p className={styles.infoBoxTitle}>✓ Förfrågan skickad!</p>
              <p className={styles.infoBoxText}>
                Tack! Vi hör av oss så snart som möjligt.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={styles.bookForm}
              style={{ marginTop: "1rem" }}
            >
              <div className={styles.formField}>
                <label className={styles.formLabel}>Namn *</label>
                <Input
                  name="name"
                  placeholder="Ditt namn"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>E-post *</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="din@email.se"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Telefonnummer</label>
                <Input
                  name="phoneNumber"
                  type="tel"
                  placeholder="070-123 45 67"
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.formField}>
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
                <div className={styles.snickeriInquiryError}>
                  {submitError}
                </div>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Skickar..." : "Skicka förfrågan"}
              </Button>
            </form>
          )}
        </section>

        {/* Back link */}
        <div>
          <Button>
            <Link href="/snickerier">← Tillbaka till snickerier</Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}