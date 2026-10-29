import Link from "next/link";
import { FileText, Users, Tags, Mail, Plus, Settings, Globe, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { StatusChip } from "@/components/admin/ui";
import { formatDate, timeAgo } from "@/lib/utils";

export default async function Dashboard() {
  const me = await requireUser();
  const { counts, recent, top } = await api.admin.stats();
  const topViews = top;
  const maxViews = Math.max(1, ...topViews.map((a) => a.views));

  const stats = [
    { label: "Artigos", value: counts.articles, sub: `${counts.published} publicados`, icon: FileText, href: "/admin/artigos", c: "bg-sky-50 text-sky-600" },
    { label: "Utilizadores", value: counts.users, sub: `${counts.activeUsers} activos`, icon: Users, href: "/admin/definicoes/utilizadores", c: "bg-violet-50 text-violet-600" },
    { label: "Categorias", value: counts.categories, sub: "Parametrização", icon: Tags, href: "/admin/definicoes/categorias", c: "bg-emerald-50 text-emerald-600" },
    { label: "Subscritores", value: counts.subscribers, sub: `${counts.smsSubscribers} com SMS`, icon: Mail, href: "/admin/subscritores", c: "bg-amber-50 text-amber-600" },
  ];
  const quick = [
    { label: "Novo artigo", href: "/admin/artigos/novo", icon: Plus, c: "bg-sky-50 text-sky-700" },
    { label: "Artigos", href: "/admin/artigos", icon: FileText, c: "bg-rose-50 text-rose-700" },
    { label: "Categorias", href: "/admin/definicoes/categorias", icon: Tags, c: "bg-emerald-50 text-emerald-700" },
    { label: "Utilizadores", href: "/admin/definicoes/utilizadores", icon: Users, c: "bg-violet-50 text-violet-700" },
    { label: "Definições", href: "/admin/definicoes", icon: Settings, c: "bg-amber-50 text-amber-700" },
    { label: "Ver site", href: "/", icon: Globe, c: "bg-teal-50 text-teal-700" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-navy-900">
        <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/90 to-brand/30" />
        <div className="relative p-8 md:p-10">
          <p className="text-sm text-brand-300">Olá, {me.name.split(" ")[0]}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-white md:text-4xl">Backoffice Thekinoloji</h1>
          <p className="mt-2 max-w-lg text-white/70">Gira artigos, utilizadores e a parametrização do portal num só lugar.</p>
          <Link href="/admin/artigos/novo" className="btn-primary mt-6"><Plus size={16} />Novo artigo</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href, c }) => (
          <Link key={label} href={href} className="card flex items-center gap-4 p-5 hover:border-brand/40">
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${c}`}><Icon size={22} /></span>
            <span><span className="block font-display text-2xl font-bold text-ink">{value}</span><span className="block text-sm text-slate-600">{label}</span><span className="text-xs text-slate-400">{sub}</span></span>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {quick.map(({ label, href, icon: Icon, c }) => (
            <Link key={label} href={href} className={`flex flex-col items-center gap-2 rounded-xl p-5 text-sm font-semibold ${c} hover:brightness-95`}>
              <Icon size={24} />{label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5"><h2 className="font-display text-lg font-bold text-ink">Artigos recentes</h2><Link href="/admin/artigos" className="text-sm font-medium text-brand hover:underline">Ver todos</Link></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-2">Título</th><th className="px-3 py-2">Categoria</th><th className="px-3 py-2">Estado</th><th className="px-5 py-2">Data</th></tr></thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="max-w-xs truncate px-5 py-3 font-medium"><Link href={`/admin/artigos/${a.id}`} className="hover:text-brand">{a.title}</Link></td>
                    <td className="px-3 py-3"><span className="rounded px-2 py-0.5 text-xs font-semibold text-white" style={{ background: a.category.color }}>{a.category.name}</span></td>
                    <td className="px-3 py-3"><StatusChip status={a.status} /></td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">Mais lidos</h2>
            <ul className="space-y-3">
              {topViews.map((a) => (
                <li key={a.id}>
                  <div className="flex items-center justify-between gap-2 text-sm"><span className="truncate font-medium">{a.title}</span><span className="inline-flex flex-none items-center gap-1 text-xs text-slate-500"><Eye size={12} />{a.views.toLocaleString("pt-PT")}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${(a.views / maxViews) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">Novidades</h2>
            <ul className="space-y-4">
              {recent.slice(0, 3).map((a, i) => (
                <li key={a.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${i === 0 ? "bg-brand" : "bg-slate-300"}`} />
                  <div><div className="text-sm font-medium">{a.status === "published" ? "Publicado" : "Rascunho"}: {a.title}</div><div className="text-xs text-slate-500">{a.author.name} · {timeAgo(a.updatedAt)}</div></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
