import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { Notice, PageHeader, ROLE_LABEL } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteUser } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";

export default async function UsersPage({ searchParams }: { searchParams: { erro?: string } }) {
  const me = await requireRole("admin");
  const users = await api.admin.users();
  return (
    <>
      <PageHeader title="Utilizadores" subtitle="Quem tem acesso ao backoffice">
        <Link href="/admin/definicoes/utilizadores/novo" className="btn-primary"><Plus size={16} />Novo utilizador</Link>
      </PageHeader>
      <Notice code={searchParams.erro} />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">Utilizador</th><th className="px-3">Perfil</th><th className="px-3">Artigos</th><th className="px-3">Estado</th><th className="px-3">Criado em</th><th className="px-4 text-right">Acções</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={u.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /><div><div className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-slate-400">(você)</span>}</div><div className="text-xs text-slate-500">{u.email}</div></div></div></td>
                <td className="px-3"><span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">{ROLE_LABEL[u.role]}</span></td>
                <td className="px-3 tabular-nums">{u.articleCount}</td>
                <td className="px-3">{u.active ? <span className="text-xs font-semibold text-emerald-600">Activo</span> : <span className="text-xs font-semibold text-slate-400">Inactivo</span>}</td>
                <td className="whitespace-nowrap px-3 text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-4">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/definicoes/utilizadores/${u.id}`} aria-label="Editar" title="Editar" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={16} /></Link>
                    <form action={deleteUser}><input type="hidden" name="id" value={u.id} />
                      <ConfirmButton message={`Eliminar ${u.name}?`} className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></ConfirmButton></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
