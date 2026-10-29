import Link from "next/link";
import { api } from "@/lib/api";
import Newsletter from "@/components/site/Newsletter";
import VideoSection from "@/components/site/VideoSection";
import Img from "@/components/Img";
import { Badge, HeroCard, Meta, OverlayCard, RankRow, RowCard, SectionTitle, TagCloud, TileCard, TopNews } from "@/components/site/cards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ settings: st, categories }, all, videos] = await Promise.all([api.site(), api.published(), api.videos(30).catch(() => [])]);
  if (!all.length) return <p className="py-20 text-center text-muted">Ainda não há artigos publicados.</p>;

  // Hero: the featured article + up to 3 more (featured first, then newest)
  const hero = all.find((a) => a.featured) ?? all[0];
  const rest = all.filter((a) => a.id !== hero.id);
  const side = [...rest.filter((a) => a.featured), ...rest.filter((a) => !a.featured)].slice(0, 3);
  const used = new Set([hero.id, ...side.map((a) => a.id)]);
  const destaque = all.filter((a) => !used.has(a.id)).slice(0, 5);

  const top = [...all].sort((a, b) => b.views - a.views).slice(0, 5);
  const sections = categories
    .map((c) => ({ c, items: all.filter((a) => a.categories.some((x) => x.id === c.id)) }))
    .filter((x) => x.items.length >= 2);
  const [secA, secB] = sections;
  const wide = rest.slice(-3);

  return (
    <div className="space-y-12">
      {/* Hero — featured articles only */}
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <HeroCard a={hero} className="lg:min-h-[30rem]" />
        <div className="grid gap-4 lg:grid-rows-3">{side.map((a) => <OverlayCard key={a.id} a={a} />)}</div>
      </section>

      {/* Destaque */}
      <section>
        <SectionTitle title="Notícias em Destaque" href="/pesquisa" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{destaque.map((a) => <TileCard key={a.id} a={a} />)}</div>
      </section>

      {/* Category A + Top Notícias */}
      {secA && (
        <section>
          <SectionTitle title={`${secA.c.name} News`} href={`/categoria/${secA.c.slug}`} />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
              <HeroCard a={secA.items[0]} />
              <div className="space-y-4">
                {secA.items.slice(1, 4).map((a) => <div key={a.id} className="panel p-3"><RowCard a={a} /></div>)}
              </div>
            </div>
            <TopNews items={top} />
          </div>
        </section>
      )}

      {/* Category B + topics */}
      {secB && (
        <section>
          <SectionTitle title={`${secB.c.name} News`} href={`/categoria/${secB.c.slug}`} />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4 sm:grid-cols-3">{secB.items.slice(0, 3).map((a) => <TileCard key={a.id} a={a} />)}</div>
            <TagCloud tags={st.popularTags} title="Tópicos Populares" />
          </div>
        </section>
      )}

      {/* Playlist */}
      {videos.length > 0 && (
        <section>
          <SectionTitle title="Últimos Vídeos da Playlist" href="/videos" linkLabel="Ver todos" />
          <VideoSection videos={videos} />
        </section>
      )}

      {/* Popular + recent + newsletter */}
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <SectionTitle title="Populares" />
            <div className="space-y-4">{top.map((a, i) => <RankRow key={a.id} n={i + 1} a={a} />)}</div>
          </div>
          <div>
            <SectionTitle title="Artigos Recentes" />
            <div className="space-y-4">{all.slice(0, 5).map((a) => <RowCard key={a.id} a={a} />)}</div>
          </div>
        </div>
        <div className="space-y-4">
          <Newsletter title={st.newsletterTitle} text={st.newsletterText} />
          <Link href="/pesquisa" className="panel flex items-center gap-3 p-4 hover:border-brand/50">
            <img src="/logo.png" alt="" className="h-12 w-12 rounded-full" />
            <span><span className="block font-display font-bold text-ink">{st.siteName}</span><span className="text-xs text-muted">Explorar todos os artigos</span></span>
          </Link>
        </div>
      </section>

      {/* Wide posts */}
      <section>
        <SectionTitle title="Posts em Destaque" href="/pesquisa" />
        <div className="grid gap-4 md:grid-cols-3">
          {wide.map((a) => (
            <article key={a.id} className="group relative overflow-hidden rounded-xl border border-line bg-surface">
              <div className="relative h-44 overflow-hidden">
                <Img src={a.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 flex"><Badge c={a.category} /></span>
              </div>
              <div className="space-y-2 p-4">
                <h3 className="font-display text-base font-semibold text-ink"><Link href={`/artigo/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link></h3>
                <Meta a={a} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
