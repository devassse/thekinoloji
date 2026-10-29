import Link from "next/link";
import { Download, MessageSquareText, Trash2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteSubscriber } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export default async function SubscribersPage({ searchParams }: { searchParams: { q?: string; sms?: string } }) {
  await requireRole("admin", "editor");
  const onlySms = searchParams.sms === "1";
  const { items, total, withSms } = await api.admin.subscribers({ q: searchParams.q, sms: onlySms });

  const tab = (label: string, on: boolean, href: string) => (
    <Link href={href} className={`rounded-full px-3 py-1 text-sm font-medium ${on ? "bg-navy-900 text-white" : "bg-surface text-slate-600 hover:bg-slate-50"}`}>{label}</Link>
  );

  return (
    <>
      <PageHeader title="Subscritores" subtitle="Pessoas inscritas na newsletter">
        <a href="/admin/subscritores/export" className="btn-ghost"><Download size={16} />Exportar CSV</a>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600"><Users size={22} /></span><span><span className="block font-display text-2xl font-bold text-ink">{total}</span><span className="text-sm text-slate-600">Subscritores</span></span></div>
        <div className="card flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><MessageSquareText size={22} /></span><span><span className="block font-display text-2xl font-bold text-ink">{withSms}</span><span className="text-sm text-slate-600">Recebem SMS</span></span></div>
        <div className="card flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-sky-600"><Users size={22} /></span><span><span className="block font-display text-2xl font-bold text-ink">{total - withSms}</span><span className="text-sm text-slate-600">Só email</span></span></div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tab("Todos", !onlySms, "/admin/subscritores")}
        {tab("Com SMS", onlySms, "/admin/subscritores?sms=1")}
        <form className="ml-auto">{onlySms && <input type="hidden" name="sms" value="1" />}<input name="q" defaultValue={searchParams.q} placeholder="Pesquisar email ou telemóvel…" aria-label="Pesquisar" className="field w-64" /></form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">Email</th><th className="px-3">Telemóvel</th><th className="px-3">SMS</th><th className="px-3">Subscrito em</th><th className="px-4 text-right">Acções</th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-3 tabular-nums text-slate-600">{s.phone ?? "—"}</td>
                <td className="px-3">{s.smsConsent && s.phone ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Activo</span> : <span className="text-xs text-slate-400">Não</span>}</td>
                <td className="whitespace-nowrap px-3 text-slate-500">{formatDate(s.createdAt)}</td>
                <td className="px-4"><div className="flex justify-end"><form action={deleteSubscriber}><input type="hidden" name="id" value={s.id} />
                  <ConfirmButton message={`Remover ${s.email}?`} className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></ConfirmButton></form></div></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">Ainda não há subscritores.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
