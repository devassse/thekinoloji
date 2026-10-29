import { api } from "@/lib/api";
import Newsletter from "@/components/site/Newsletter";
import { TileCard } from "@/components/site/cards";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const [{ settings }, items] = await Promise.all([api.site(), api.published({ q })]);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">{q ? <>Resultados para “{q}”</> : "Todos os artigos"}</h1>
      <p className="text-sm text-muted">{items.length} {items.length === 1 ? "resultado" : "resultados"}</p>
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((a) => <TileCard key={a.id} a={a} />)}</div>
      ) : (
        <p className="py-16 text-center text-muted">Nada encontrado. Experimente outro termo.</p>
      )}
      <div className="mx-auto pt-6"><Newsletter title={settings.newsletterTitle} text={settings.newsletterText} /></div>
    </div>
  );
}
