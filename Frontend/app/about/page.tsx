import Navbar from "../components/Navbar";

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-6">
      <Navbar />
      <h1 className="text-3xl font-semibold mt-12">About us</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        We are a construction company focused on quality craftsmanship
        and long-lasting building solutions.
      </p>
    </main>
  );
}
