import Link from "next/link";
import { Plus, LayoutList, LayoutGrid, MessageSquareText, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { Notice, PageHeader, StatusChip } from "@/components/admin/ui";
import ArticleActions from "@/components/admin/ArticleActions";
import { formatDate } from "@/lib/utils";

type SP = { q?: string; estado?: string; vista?: string; erro?: string };

export default async function ArticlesPage({ searchParams }: { searchParams: SP }) {
  const me = await requireUser();
  const q = (searchParams.q ?? "").toLowerCase().trim();
  const estado = searchParams.estado === "published" || searchParams.estado === "draft" ? searchParams.estado : undefined;
  const vista = searchParams.vista === "cards" ? "cards" : "lista";

  const items = await api.admin.articles({ q: searchParams.q, estado });
  const canManage = me.role !== "author";

  const href = (o: Partial<SP>) => {
    const p = new URLSearchParams();
    const m = { estado, q: searchParams.q, vista, ...o };
    Object.entries(m).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/admin/artigos?${p.toString()}`;
  };
  const tab = (label: string, e?: string) => (
    <Link href={href({ estado: e })} className={`rounded-full px-3 py-1 text-sm font-medium ${estado === e ? "bg-navy-900 text-white" : "bg-surface text-slate-600 hover:bg-slate-50"}`}>{label}</Link>
  );
  const toggle = (v: string, label: string, Icon: typeof LayoutList) => (
    <Link href={href({ vista: v })} aria-label={label} title={label} aria-current={vista === v}
      className={`grid h-9 w-9 place-items-center rounded-md transition-colors ${vista === v ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}><Icon size={18} /></Link>
  );
  const sms = (n?: number) => n ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><MessageSquareText size={12} />SMS: {n}</span> : null;

  return (
    <>
      <PageHeader title="Artigos" subtitle={`${items.length} resultado(s)`}>
        <Link href="/admin/artigos/novo" className="btn-primary"><Plus size={16} />Novo artigo</Link>
      </PageHeader>
      <Notice code={searchParams.erro} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tab("Todos")}{tab("Publicados", "published")}{tab("Rascunhos", "draft")}
        <form className="ml-auto flex items-center gap-2">
          {estado && <input type="hidden" name="estado" value={estado} />}
          <input type="hidden" name="vista" value={vista} />
          <input name="q" defaultValue={searchParams.q} placeholder="Filtrar por título…" aria-label="Filtrar" className="field w-56" />
          <div className="flex rounded-lg border border-slate-200 bg-surface p-0.5" role="group" aria-label="Modo de visualização">
            {toggle("lista", "Vista em lista", LayoutList)}{toggle("cards", "Vista em cards", LayoutGrid)}
          </div>
        </form>
      </div>

      {!items.length && (
        <div className="card px-4 py-12 text-center text-slate-500">Nenhum artigo encontrado. <Link href="/admin/artigos/novo" className="font-medium text-brand">Criar o primeiro artigo</Link></div>
      )}

      {items.length > 0 && vista === "cards" && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((a) => (
            <article key={a.id} className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
              <div className="relative aspect-[16/9] bg-slate-200">
                {a.image && <img src={a.image} alt="" className="h-full w-full object-cover" loading="lazy" />}
                <span className="absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: a.category.color }}>{a.category.name}{a.categories.length > 1 && ` +${a.categories.length - 1}`}</span>
                <span className="absolute right-3 top-3"><StatusChip status={a.status} /></span>
                {a.featured && <span className="absolute bottom-3 left-3 rounded bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">Destaque</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="line-clamp-2 font-display font-semibold leading-snug text-ink">
                  <Link href={`/admin/artigos/${a.id}`} className="hover:text-brand">{a.title}</Link>
                </h2>
                <p className="line-clamp-2 text-sm text-slate-500">{a.excerpt}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><img src={a.author.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />{a.author.name}</span>
                  <span>{formatDate(a.createdAt)}</span>
                  <span className="inline-flex items-center gap-1"><Eye size={12} />{a.views.toLocaleString("pt-PT")}</span>
                  {sms(a.notifiedCount ?? undefined)}
                </div>
              </div>
              <div className="flex justify-end border-t border-slate-100 px-3 py-2"><ArticleActions a={a} canManage={canManage} /></div>
            </article>
          ))}
        </div>
      )}

      {items.length > 0 && vista === "lista" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr><th className="px-4 py-3">Artigo</th><th className="px-3">Categoria</th><th className="px-3">Autor</th><th className="px-3">Estado</th><th className="px-3 text-right">Visitas</th><th className="px-3">Data</th><th className="px-4 text-right">Acções</th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {a.image && <img src={a.image} alt="" className="h-10 w-14 flex-none rounded object-cover" />}
                      <div className="min-w-0 max-w-sm"><Link href={`/admin/artigos/${a.id}`} className="block truncate font-medium hover:text-brand">{a.title}</Link><div className="flex gap-2">{a.featured && <span className="text-xs font-semibold text-brand">Destaque</span>}{sms(a.notifiedCount ?? undefined)}</div></div>
                    </div>
                  </td>
                  <td className="px-3"><div className="flex flex-wrap gap-1">{a.categories.map((c) => <span key={c.id} className="rounded px-2 py-0.5 text-xs font-semibold text-white" style={{ background: c.color }}>{c.name}</span>)}</div></td>
                  <td className="px-3 text-slate-600">{a.author.name}</td>
                  <td className="px-3"><StatusChip status={a.status} /></td>
                  <td className="px-3 text-right tabular-nums text-slate-600">{a.views.toLocaleString("pt-PT")}</td>
                  <td className="whitespace-nowrap px-3 text-slate-500">{formatDate(a.createdAt)}</td>
                  <td className="px-4"><div className="flex justify-end"><ArticleActions a={a} canManage={canManage} /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
