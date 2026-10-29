import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteCategory, saveCategory } from "@/app/admin/actions";

export default async function CategoriesPage({ searchParams }: { searchParams: { erro?: string } }) {
  await requireRole("admin", "editor");
  const categories = await api.admin.categories();
  return (
    <>
      <PageHeader title="Categorias" subtitle="Aparecem no menu do site e no formulário de artigos" />
      <Notice code={searchParams.erro} />

      <form action={saveCategory} className="card mb-6 grid items-end gap-3 p-5 sm:grid-cols-[1fr_1fr_90px_auto]">
        <div><label className="label" htmlFor="n-name">Nova categoria</label><input id="n-name" name="name" required placeholder="Ex.: Segurança" className="field" /></div>
        <div><label className="label" htmlFor="n-slug">Slug (opcional)</label><input id="n-slug" name="slug" className="field" /></div>
        <div><label className="label" htmlFor="n-color">Cor</label><input id="n-color" name="color" type="color" defaultValue="#1e6bff" className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-surface p-1" /></div>
        <button className="btn-primary">Adicionar</button>
      </form>

      <div className="card divide-y divide-slate-100">
        {categories.map((c) => {
          const fid = `cat-${c.id}`;
          return (
            <div key={c.id} className="grid items-center gap-3 p-4 sm:grid-cols-[1fr_1fr_90px_80px_auto]">
              <form id={fid} action={saveCategory} className="contents">
                <input type="hidden" name="id" value={c.id} />
                <input name="name" defaultValue={c.name} required aria-label="Nome" className="field" />
                <input name="slug" defaultValue={c.slug} aria-label="Slug" className="field" />
                <input name="color" type="color" defaultValue={c.color} aria-label="Cor" className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-surface p-1" />
                <span className="text-sm text-slate-500">{c.articleCount} {c.articleCount === 1 ? "artigo" : "artigos"}</span>
              </form>
              <div className="flex gap-2">
                <button form={fid} className="btn-ghost px-3 py-2">Guardar</button>
                <form action={deleteCategory}><input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Eliminar a categoria ${c.name}?`} className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></ConfirmButton></form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
