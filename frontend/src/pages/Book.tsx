import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../pages.module.css";
import PageMeta from "../components/PageMeta";

export default function Book() {
  const navigate = useNavigate();
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirm("Är du säker på att du vill skicka denna förfrågan?")) return;

    try {
      const res = await fetch("/api/Booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.Message || "Förfrågan skickad!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Något gick fel. Vänligen försök igen.");
    }
  };

  return (
    <div className={styles.page}>
      <PageMeta
        title="Boka Konsultation"
        description="Boka en kostnadsfri konsultation med Terrys Allbygg. Vi återkommer inom 24 timmar."
        canonical="/book"
        noIndex={true}
      />

      <Navbar />

      <main className={styles.mainNarrow}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <header>
            <h1 className={styles.pageTitle}>Boka Konsultation</h1>
            <p className={styles.pageSubtitle}>
              Fyll i formuläret nedan så återkommer vi till dig inom 24 timmar.
            </p>
          </header>

          <form className={styles.bookForm} onSubmit={handleSubmit}>

            {/* Row 1: Namn + E-post */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Namn *</label>
              <Input name="name" placeholder="Ditt namn" value={form.name} onChange={handleChange} required />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>E-post *</label>
              <Input name="email" placeholder="din@email.se" type="email" value={form.email} onChange={handleChange} required />
            </div>

            {/* Row 2: Telefon + Byggesplats */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Telefonnummer</label>
              <Input name="phoneNumber" placeholder="070-123 45 67" type="tel" value={form.phoneNumber} onChange={handleChange} />
            </div>

            <div className={styles.formField}>
              <label className={styles.formLabel}>Byggesplats *</label>
              <Select name="placement" value={form.placement} onChange={handleChange} required placeholder="Välj var projektet ska utföras">
                <option value="innomhus">Inomhus</option>
                <option value="utomhus">Utomhus</option>
                <option value="annat">Annat</option>
              </Select>
            </div>

            {/* Conditional: specificera byggesplats — full width */}
            {form.placement === "annat" && (
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>Specificera byggesplats</label>
                <Input name="other1" placeholder="Beskriv platsen" value={form.other1} onChange={handleChange} />
              </div>
            )}

            {/* Row 3: Typ av projekt + Adress */}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Typ av projekt *</label>
              <Select name="project" value={form.project} onChange={handleChange} required placeholder="Välj typ av byggprojekt">
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
              <label className={styles.formLabel}>Adress *</label>
              <Input name="address" placeholder="Gatuadress, Ort" value={form.address} onChange={handleChange} required />
            </div>

            {/* Conditional: specificera projekttyp — full width */}
            {form.project === "annat" && (
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>Specificera projekttyp</label>
                <Input name="other2" placeholder="Beskriv ditt projekt" value={form.other2} onChange={handleChange} />
              </div>
            )}

            {/* Projektbeskrivning — full width */}
            <div className={`${styles.formField} ${styles.formFieldFull}`}>
              <label className={styles.formLabel}>Projektbeskrivning *</label>
              <Textarea
                name="description"
                rows={6}
                placeholder="Berätta mer om ditt projekt, önskemål och tidsram..."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit — full width */}
            <div className={styles.formFieldFull}>
              <Button type="submit" className="w-full">
                Skicka förfrågan
              </Button>
            </div>

          </form>

          <div className={styles.infoBox}>
            <h3 className={styles.infoBoxTitle}>Kontaktinformation</h3>
            <div className={styles.infoBoxText}>
              <p>📍 Österlen, Skåne</p>
              <p style={{ marginTop: "0.5rem" }}>Vi svarar normalt inom 24 timmar på vardagar.</p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}