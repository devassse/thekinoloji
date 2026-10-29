"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page px-6 text-center text-ink">
      <img src="/logo.png" alt="" className="h-20 w-20" />
      <h1 className="font-display text-2xl font-bold">Não foi possível carregar os dados</h1>
      <p className="max-w-md text-muted">O servidor da API pode estar desligado. Confirme que o backend está a correr em <code className="text-link">http://localhost:4000</code> e tente novamente.</p>
      <button onClick={reset} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-400">Tentar novamente</button>
    </main>
  );
}
