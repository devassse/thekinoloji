import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Img from "@/components/Img";
import Newsletter from "@/components/site/Newsletter";
import ShareBar from "@/components/site/ShareBar";
import ViewTracker from "@/components/site/ViewTracker";
import { Badge, Meta, RankRow, RowCard, SectionTitle } from "@/components/site/cards";
import { api, ApiError } from "@/lib/api";
import { clean, toHtml } from "@/lib/content";
import { siteUrl } from "@/lib/url";
import type { ArticleView } from "@/lib/types";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<ArticleView> {
  try { return await api.article(slug); }
  catch (e) { if (e instanceof ApiError && e.status === 404) notFound(); throw e; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const a = await api.article(params.slug);
    return {
      title: a.title, description: a.excerpt,
      openGraph: { type: "article", title: a.title, description: a.excerpt, images: a.image ? [a.image] : [], url: `/artigo/${a.slug}` },
      twitter: { card: "summary_large_image", title: a.title, description: a.excerpt, images: a.image ? [a.image] : [] },
    };
  } catch { return {}; }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const a = await load(params.slug);
  // if (a.status === "published") await api.countView(a.slug).catch(() => {});

  const [{ settings }, published] = await Promise.all([api.site(), api.published()]);
  const pub = published.filter((x) => x.id !== a.id);
  const ids = new Set(a.categories.map((c) => c.id));
  const related = [...pub.filter((x) => x.categories.some((c) => ids.has(c.id))), ...pub.filter((x) => !x.categories.some((c) => ids.has(c.id)))].slice(0, 4);
  const top = [...pub].sort((x, y) => y.views - x.views).slice(0, 5);
  const url = `${siteUrl()}/artigo/${a.slug}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <article className="min-w-0">
        {a.status === "published" && <ViewTracker slug={a.slug} />}
        {a.status === "draft" && <p className="mb-4 rounded-lg bg-amber-400/15 px-4 py-2 text-sm text-amber-600 dark:text-amber-300">Pré-visualização de rascunho — não está público.</p>}
        <div className="flex flex-wrap gap-2">{a.categories.map((c) => <Badge key={c.id} c={c} />)}</div>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink md:text-4xl">{a.title}</h1>
        <p className="mt-3 text-lg text-body">{a.excerpt}</p>
        <div className="mt-4 flex items-center gap-3">
          <img src={a.author.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div><div className="text-sm font-semibold text-ink">{a.author.name}</div><Meta a={a} author={false} /></div>
        </div>
        {a.image && <Img src={a.image} alt="" className="mt-6 aspect-[16/9] w-full rounded-xl object-cover" />}
        <div className="prose-article mt-8 max-w-3xl text-body [--pa-head:rgb(var(--c-ink))] [--pa-link:rgb(var(--c-link))]"
          dangerouslySetInnerHTML={{ __html: clean(toHtml(a.content)) }} />
        {a.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {a.tags.map((t) => <a key={t} href={`/pesquisa?q=${encodeURIComponent(t)}`} className="rounded border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs text-link">#{t}</a>)}
          </div>
        )}
        <ShareBar url={url} title={a.title} settings={settings} />
        <section className="mt-12">
          <SectionTitle title="Leia também" />
          <div className="grid gap-5 sm:grid-cols-2">{related.map((r) => <div key={r.id} className="panel p-3"><RowCard a={r} /></div>)}</div>
        </section>
      </article>
      <aside className="space-y-6">
        <div className="panel p-4">
          <h2 className="mb-3 font-display text-sm font-bold text-ink">Mais lidas</h2>
          <div className="space-y-4">{top.map((x, i) => <RankRow key={x.id} n={i + 1} a={x} />)}</div>
        </div>
        <Newsletter compact title={settings.newsletterTitle} text={settings.newsletterText} />
      </aside>
    </div>
  );
}
