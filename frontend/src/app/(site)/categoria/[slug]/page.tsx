import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import Newsletter from "@/components/site/Newsletter";
import { TileCard } from "@/components/site/cards";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { categories, settings } = await api.site();
  const cat = categories.find((c) => c.slug === params.slug);
  if (!cat) notFound();
  const items = await api.published({ category: cat.slug });
  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-line bg-surface p-8" style={{ borderLeft: `6px solid ${cat.color}` }}>
        <h1 className="font-display text-3xl font-extrabold text-ink">{cat.name}</h1>
        <p className="mt-1 text-sm text-muted">{items.length} {items.length === 1 ? "artigo" : "artigos"}</p>
      </header>
      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((a) => <TileCard key={a.id} a={a} />)}</div>
      ) : (
        <p className="py-16 text-center text-muted">Ainda não há artigos nesta categoria.</p>
      )}
      {/* Article Footer Newsletter */}
      <div className="mx-auto"><Newsletter title={settings.newsletterTitle} text={settings.newsletterText} /></div>
    </div>
  );
}
