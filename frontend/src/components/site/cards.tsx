import Link from "next/link";
import { Clock, Eye, User as UserIcon } from "lucide-react";
import Img from "@/components/Img";
import type { ArticleView, Category } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function Badge({ c }: { c: Category }) {
  return (
    <Link href={`/categoria/${c.slug}`} style={{ background: c.color }}
      className="inline-block w-fit self-start rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      {c.name}
    </Link>
  );
}

export function Meta({ a, author = true, onImage = false }: { a: ArticleView; author?: boolean; onImage?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${onImage ? "text-white/75" : "text-muted"}`}>
      {author && <span className="inline-flex items-center gap-1"><UserIcon size={12} />{a.author.name}</span>}
      <span className="inline-flex items-center gap-1"><Clock size={12} />{timeAgo(a.createdAt)}</span>
      <span className="inline-flex items-center gap-1"><Eye size={12} />{a.views.toLocaleString("pt-PT")}</span>
    </div>
  );
}

export function SectionTitle({ title, href, linkLabel = "Ver todas" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-3 font-display text-lg font-bold text-ink">
        <span className="h-5 w-1 rounded bg-brand" />{title}
      </h2>
      {href && <Link href={href} className="text-xs font-medium text-link hover:underline">{linkLabel}</Link>}
    </div>
  );
}

/* Cards that sit on top of a photo keep white text in both themes */
export function HeroCard({ a, className = "" }: { a: ArticleView; className?: string }) {
  return (
    <article className={`group relative overflow-hidden rounded-xl bg-navy-800 ${className}`}>
      <Img src={a.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent" />
      <div className="relative flex h-full min-h-[22rem] flex-col justify-end gap-3 p-6">
        <Badge c={a.category} />
        <h2 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
          <Link href={`/artigo/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link>
        </h2>
        <p className="line-clamp-2 max-w-2xl text-sm text-white/80">{a.excerpt}</p>
        <Meta a={a} onImage />
      </div>
    </article>
  );
}

export function OverlayCard({ a }: { a: ArticleView }) {
  return (
    <article className="group relative h-full min-h-[9.5rem] overflow-hidden rounded-xl bg-navy-800">
      <Img src={a.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent" />
      <div className="relative flex h-full flex-col justify-end gap-1.5 p-4">
        <Badge c={a.category} />
        <h3 className="text-sm font-semibold leading-snug text-white">
          <Link href={`/artigo/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link>
        </h3>
        <Meta a={a} author={false} onImage />
      </div>
    </article>
  );
}

export function TileCard({ a }: { a: ArticleView }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-line bg-surface">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Img src={a.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2 top-2 flex"><Badge c={a.category} /></span>
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          <Link href={`/artigo/${a.slug}`} className="after:absolute after:inset-0">{a.title}</Link>
        </h3>
        <Meta a={a} />
      </div>
    </article>
  );
}

export function RowCard({ a }: { a: ArticleView }) {
  return (
    <article className="group relative flex gap-3">
      <Img src={a.image} alt="" className="h-16 w-24 flex-none rounded-lg object-cover" />
      <div className="min-w-0 space-y-1">
        <span style={{ color: a.category.color }} className="text-[10px] font-bold uppercase">{a.category.name}</span>
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
          <Link href={`/artigo/${a.slug}`} className="after:absolute after:inset-0 group-hover:text-link">{a.title}</Link>
        </h3>
        <Meta a={a} author={false} />
      </div>
    </article>
  );
}

export function RankRow({ n, a }: { n: number; a: ArticleView }) {
  return (
    <article className="group relative flex items-center gap-3">
      <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-brand text-xs font-bold text-white">{n}</span>
      <Img src={a.image} alt="" className="h-12 w-16 flex-none rounded-lg object-cover" />
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
          <Link href={`/artigo/${a.slug}`} className="after:absolute after:inset-0 group-hover:text-link">{a.title}</Link>
        </h3>
        <Meta a={a} author={false} />
      </div>
    </article>
  );
}

export function TopNews({ items }: { items: ArticleView[] }) {
  return (
    <aside className="panel p-4">
      <h2 className="mb-4 flex items-center gap-3 font-display text-sm font-bold text-ink"><span className="h-4 w-1 rounded bg-brand" />Top Notícias</h2>
      <div className="space-y-4">{items.map((a, i) => <RankRow key={a.id} n={i + 1} a={a} />)}</div>
    </aside>
  );
}

export function TagCloud({ tags, title }: { tags: string[]; title: string }) {
  return (
    <div className="panel p-5">
      <h3 className="mb-3 font-display text-sm font-bold text-ink">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link key={t} href={`/pesquisa?q=${encodeURIComponent(t)}`}
            className="rounded border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs text-link hover:bg-brand/20">
            #{t.replace(/\s+/g, "")}
          </Link>
        ))}
      </div>
    </div>
  );
}
