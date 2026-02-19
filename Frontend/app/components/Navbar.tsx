import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/95 backdrop-blur-md z-50 shadow-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-primary">Terrys All Bygg</h1>
        </Link>
        <div className="flex gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">
            Hem
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            Om Oss
          </Link>
          <Link href="/book" className="hover:text-primary transition-colors">
            Boka
          </Link>
          <Link href="/admin/login" className="hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}