import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, MapPin } from "lucide-react";
import styles from "../pages.module.css";
import PageMeta from "../components/PageMeta";
import PrivacyNotice from "../components/PrivacyNotice";
import { CONTACT } from "../lib/contact";

type Status = "idle" | "sending" | "sent" | "error";

export default function Book() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    placement: "",
    other1: "",
    project: "",
    other2: "",
    address: "",
    description: "",
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/Booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, privacyAccepted }),
      });
      if (res.status === 429) {
        setErrorMsg("Du har skickat flera förfrågningar på kort tid. Vänta en stund eller ring oss direkt.");
        setStatus("error");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Förfrågan kunde inte skickas. Försök igen, eller ring oss direkt.");
      setStatus("error");
    }
  };

  return (
    <div className={styles.page}>
      <PageMeta
        title="Boka kostnadsfri konsultation"
        description="Berätta om ditt byggprojekt på Österlen – bastu, altan, tillbyggnad eller förråd. Konsultationen är kostnadsfri och vi svarar inom 24 timmar på vardagar."
        canonical="/book"
      />

      <Navbar />

      <main className={styles.mainNarrow}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <header>
            <h1 className={styles.pageTitle}>Boka kostnadsfri konsultation</h1>
            <p className={styles.pageSubtitle}>
              Fyll i formuläret nedan så återkommer vi till dig inom 24 timmar.
            </p>
          </header>

          {status === "sent" ? (
            <div className={styles.infoBox} role="status">
              <p className={`${styles.infoBoxTitle} ${styles.iconLine}`}><CircleCheck size={18} aria-hidden /> Tack, din förfrågan är skickad!</p>
              <p className={styles.infoBoxText}>
                Vi har skickat en bekräftelse till {form.email}. Vi hör av oss inom 24 timmar
                på vardagar. Brådskande? Ring <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
              </p>
              <div className={styles.formSuccessActions}>
                <Link to="/" className={styles.btnGhost}>Till startsidan</Link>
              </div>
            </div>
          ) : (
          <form className={styles.bookForm} onSubmit={handleSubmit}>

            {/* Row 1: Namn + E-post */}
            <div className={styles.formField}>
              <label htmlFor="book-name" className={styles.formLabel}>Namn *</label>
              <Input id="book-name" name="name" autoComplete="name" placeholder="Ditt namn" value={form.name} onChange={handleChange} required />
            </div>

            <div className={styles.formField}>
              <label htmlFor="book-email" className={styles.formLabel}>E-post *</label>
              <Input id="book-email" name="email" autoComplete="email" placeholder="din@email.se" type="email" value={form.email} onChange={handleChange} required />
            </div>

            {/* Row 2: Telefon + Byggplats */}
            <div className={styles.formField}>
              <label htmlFor="book-phoneNumber" className={styles.formLabel}>Telefonnummer</label>
              <Input id="book-phoneNumber" name="phoneNumber" autoComplete="tel" placeholder="070-123 45 67" type="tel" value={form.phoneNumber} onChange={handleChange} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="book-placement" className={styles.formLabel}>Byggplats *</label>
              <Select id="book-placement" name="placement" value={form.placement} onChange={handleChange} required placeholder="Välj var projektet ska utföras">
                <option value="inomhus">Inomhus</option>
                <option value="utomhus">Utomhus</option>
                <option value="annat">Annat</option>
              </Select>
            </div>

            {/* Conditional: specificera byggplats — full width */}
            {form.placement === "annat" && (
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="book-other1" className={styles.formLabel}>Specificera byggplats</label>
                <Input id="book-other1" name="other1" placeholder="Beskriv platsen" value={form.other1} onChange={handleChange} />
              </div>
            )}

            {/* Row 3: Typ av projekt + Adress */}
            <div className={styles.formField}>
              <label htmlFor="book-project" className={styles.formLabel}>Typ av projekt *</label>
              <Select id="book-project" name="project" value={form.project} onChange={handleChange} required placeholder="Välj typ av byggprojekt">
                <option value="altan">Altan</option>
                <option value="garage">Garage</option>
                <option value="friggebod">Friggebod</option>
                <option value="pool">Pool</option>
                <option value="bastu">Bastu</option>
                <option value="tillbyggnad">Tillbyggnad</option>
                <option value="forrad">Förråd</option>
                <option value="studio">Trädgårdsstudio</option>
                <option value="renovering">Renovering</option>
                <option value="annat">Annat</option>
              </Select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="book-address" className={styles.formLabel}>Adress *</label>
              <Input id="book-address" name="address" autoComplete="street-address" placeholder="Gatuadress, Ort" value={form.address} onChange={handleChange} required />
            </div>

            {/* Conditional: specificera projekttyp — full width */}
            {form.project === "annat" && (
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label htmlFor="book-other2" className={styles.formLabel}>Specificera projekttyp</label>
                <Input id="book-other2" name="other2" placeholder="Beskriv ditt projekt" value={form.other2} onChange={handleChange} />
              </div>
            )}

            {/* Projektbeskrivning — full width */}
            <div className={`${styles.formField} ${styles.formFieldFull}`}>
              <label htmlFor="book-description" className={styles.formLabel}>Projektbeskrivning *</label>
              <Textarea
                id="book-description" name="description"
                rows={6}
                placeholder="Berätta mer om ditt projekt, önskemål och tidsram..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Integritetsinfo + bekräftelse — full width */}
            <PrivacyNotice
              id="book-privacy"
              checked={privacyAccepted}
              onChange={setPrivacyAccepted}
            />

            {status === "error" && (
              <div className={`${styles.snickeriInquiryError} ${styles.formFieldFull}`} role="alert">
                {errorMsg} <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              </div>
            )}

            {/* Submit — full width */}
            <div className={styles.formFieldFull}>
              <Button type="submit" className="w-full" disabled={status === "sending"}>
                {status === "sending" ? "Skickar…" : "Skicka förfrågan"}
              </Button>
            </div>

          </form>
          )}

          <div className={styles.infoBox}>
            <h3 className={styles.infoBoxTitle}>Kontaktinformation</h3>
            <div className={styles.infoBoxText}>
              <p className={styles.iconLine}><MapPin size={16} aria-hidden /> Österlen, Skåne</p>
              <p style={{ marginTop: "0.5rem" }}>Vi svarar normalt inom 24 timmar på vardagar.</p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}