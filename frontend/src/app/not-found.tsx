import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6 text-center text-ink">
      <img src="/logo.png" alt="" className="h-20 w-20" />
      <h1 className="font-display text-3xl font-bold">Página não encontrada</h1>
      <p className="max-w-sm text-muted">O endereço que abriu não existe ou foi movido.</p>
      <Link href="/" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400">Voltar ao início</Link>
    </main>
  );
}
