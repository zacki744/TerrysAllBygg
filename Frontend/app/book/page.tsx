"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Book() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    placement: "",
    other1: "",
    project: "",
    other2: "",
    address: "",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirm("Är du säker på att du vill skicka denna förfrågan?")) return;

    try {
      const res = await fetch("/api/Booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      alert(data.Message || "Förfrågan skickad!");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Något gick fel. Vänligen försök igen.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-6">
          <header>
            <h1 className="text-4xl font-bold">Boka Konsultation</h1>
            <p className="mt-4 text-lg text-zinc-600">
              Fyll i formuläret nedan så återkommer vi till dig inom 24 timmar.
            </p>
          </header>

          <form className="space-y-6 border border-border rounded-xl p-8 bg-white shadow-sm" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Namn *</label>
              <Input 
                name="name" 
                placeholder="Ditt namn" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-post *</label>
              <Input 
                name="email" 
                placeholder="din@email.se" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefonnummer</label>
              <Input 
                name="phoneNumber" 
                placeholder="070-123 45 67" 
                type="tel" 
                value={form.phoneNumber} 
                onChange={handleChange} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Byggesplats *</label>
              <Select 
                name="placement" 
                value={form.placement} 
                onChange={handleChange} 
                required 
                placeholder="Välj var projektet ska utföras"
              >
                <option value="innomhus">Inomhus</option>
                <option value="utomhus">Utomhus</option>
                <option value="annat">Annat</option>
              </Select>
            </div>

            {form.placement === "annat" && (
              <div>
                <label className="block text-sm font-medium mb-2">Specificera byggesplats</label>
                <Input 
                  name="other1" 
                  placeholder="Beskriv platsen" 
                  value={form.other1} 
                  onChange={handleChange} 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Typ av projekt *</label>
              <Select 
                name="project" 
                value={form.project} 
                onChange={handleChange} 
                required 
                placeholder="Välj typ av byggprojekt"
              >
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

            {form.project === "annat" && (
              <div>
                <label className="block text-sm font-medium mb-2">Specificera projekttyp</label>
                <Input 
                  name="other2" 
                  placeholder="Beskriv ditt projekt" 
                  value={form.other2} 
                  onChange={handleChange} 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Adress *</label>
              <Input 
                name="address" 
                placeholder="Gatuadress, Ort" 
                value={form.address} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Projektbeskrivning *</label>
              <Textarea 
                name="description" 
                rows={6} 
                placeholder="Berätta mer om ditt projekt, önskemål och tidsram..." 
                value={form.description} 
                onChange={handleChange} 
                required 
              />
            </div>

            <Button type="submit" className="w-full">
              Skicka förfrågan
            </Button>
          </form>

          <div className="bg-zinc-50 border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-3">Kontaktinformation</h3>
            <div className="space-y-2 text-sm text-zinc-600">
              <p>📍 Österlen, Skåne</p>
              <p>Vi svarar normalt inom 24 timmar på vardagar.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}