import Link from "next/link";
import Button from "@/app/components/ui/Button";
export default function Hero() {
  return (
    <section className="max-w-2xl py-12">
      <h1 className="text-5xl font-bold leading-tight text-foreground">
        Skräddarsydda byggprojekt i Österlen
      </h1>
      <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-400 leading-relaxed">
        Terrys All Bygg är ditt lokala byggföretag i Österlen, Skåne. Vi designar 
        och uppför högkvalitativa byggprojekt såsom bastuer, tillbyggnader, förråd 
        och andra specialanpassade lösningar.
      </p>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        Med fokus på hållbarhet, funktion och detaljer hjälper vi dig från idé till 
        färdigt resultat. Oavsett om det är en utomhusbastu, en trädgårdsstudio eller 
        en tillbyggnad – vi förverkligar ditt projekt med kvalitet och omsorg.
      </p>
      <Button className="mt-8">
        <Link href="/book">Boka en konsultation</Link>
      </Button>
    </section>
  );
}