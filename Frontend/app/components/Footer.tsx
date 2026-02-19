import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border py-12 bg-zinc-50 w-full">
      <div className="mx-auto max-w-7xl px-6 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {/* Company Info */}
        <div>
          <p className="text-lg font-bold text-primary mb-2">Terrys All Bygg</p>
          <p className="text-sm text-zinc-600">
            Lokalt byggföretag i Österlen, Skåne
          </p>
          <p className="text-sm text-zinc-600 mt-4">
            Professionell service för skräddarsydda byggprojekt
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <p className="text-sm font-semibold mb-3 text-foreground">Snabblänkar</p>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-zinc-600 hover:text-primary transition-colors">
              Hem
            </Link>
            <Link href="/about" className="text-zinc-600 hover:text-primary transition-colors">
              Om Oss
            </Link>
            <Link href="/book" className="text-zinc-600 hover:text-primary transition-colors">
              Boka Konsultation
            </Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold mb-3 text-foreground">Kontakt</p>
          <div className="text-sm text-zinc-600 space-y-2">
            <p>📍 Österlen, Skåne</p>
            <p>📧 <Link href="/book" className="hover:text-primary transition-colors">Boka via mejl</Link></p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto max-w-7xl px-6 mt-8 pt-8 border-t border-border text-center">
        <p className="text-sm text-zinc-600">
          © {new Date().getFullYear()} Terrys All Bygg. Alla rättigheter förbehållna.
        </p>
      </div>
    </footer>
  );
}