import Link from "next/link";
import type { Article, Category } from "@/lib/types";
import { saveArticle } from "@/app/admin/actions";
import { toHtml } from "@/lib/content";
import RichEditor from "./RichEditor";
import ImageField from "./ImageField";

type Props = { article?: Article; categories: Category[]; authors: { id: string; name: string }[]; role: string; smsEnabled: boolean; smsCount: number };

export default function ArticleForm({ article, categories, authors, role, smsEnabled, smsCount }: Props) {
  const canPublish = role !== "author";
  const extraIds = new Set((article?.categories ?? []).filter((c) => c.id !== article?.categoryId).map((c) => c.id));
  return (
    <form action={saveArticle} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="id" defaultValue={article?.id ?? ""} />
      <div className="card min-w-0 space-y-4 p-6">
        <div><label className="label" htmlFor="title">Título *</label><input id="title" name="title" required defaultValue={article?.title} className="field text-base font-semibold" /></div>
        <div>
          <label className="label" htmlFor="excerpt">Resumo (usado também no SMS)</label>
          <textarea id="excerpt" name="excerpt" rows={2} defaultValue={article?.excerpt} className="field" />
        </div>
        <div>
          <span className="label">Conteúdo</span>
          <RichEditor name="content" initial={toHtml(article?.content ?? "")} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="card space-y-4 p-5">
          {canPublish ? (
            <div><label className="label" htmlFor="status">Estado</label>
              <select id="status" name="status" defaultValue={article?.status ?? "draft"} className="field"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></div>
          ) : <p className="text-xs text-slate-500">Como autor, os seus artigos ficam como rascunho até um editor os publicar.</p>}
          {canPublish && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={article?.featured} className="h-4 w-4 accent-brand" />Artigo em destaque (topo da home)</label>}
          <div><label className="label" htmlFor="categoryId">Categoria principal</label>
            <select id="categoryId" name="categoryId" required defaultValue={article?.categoryId} className="field">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <fieldset>
            <legend className="label">Outras categorias</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <label key={c.id} className="cursor-pointer">
                  <input type="checkbox" name="extraCategoryIds" value={c.id} defaultChecked={extraIds.has(c.id)} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40">{c.name}</span>
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">O artigo aparece em todas as categorias marcadas. A principal define a cor do selo.</p>
          </fieldset>
          {canPublish && (
            <div><label className="label" htmlFor="authorId">Autor</label>
              <select id="authorId" name="authorId" defaultValue={article?.authorId} className="field">{authors.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          )}
          <div><label className="label" htmlFor="tags">Etiquetas</label><input id="tags" name="tags" defaultValue={article?.tags.join(", ")} placeholder="IA, Hardware, Apple" className="field" /></div>
          <div><label className="label" htmlFor="slug">Endereço (slug)</label><input id="slug" name="slug" defaultValue={article?.slug} placeholder="gerado a partir do título" className="field" /></div>
        </div>

        <div className="card p-5"><ImageField name="image" label="Imagem de capa" defaultValue={article?.image} /></div>

        {canPublish && (
          <div className="card space-y-2 p-5">
            <h3 className="text-sm font-semibold text-ink">Notificação por SMS</h3>
            {!smsEnabled ? (
              <p className="text-xs text-slate-500">Os SMS estão desactivados em Definições.</p>
            ) : article?.notifiedAt ? (
              <p className="text-xs text-emerald-700">SMS já enviado a {article.notifiedCount ?? 0} subscritor(es). Não é reenviado ao guardar novamente.</p>
            ) : (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="notifySms" defaultChecked className="mt-0.5 h-4 w-4 accent-brand" />
                <span>Enviar SMS a <b>{smsCount}</b> subscritor(es) ao publicar<span className="block text-xs text-slate-500">Inclui o título e o resumo. Só é enviado se o estado for “Publicado”.</span></span>
              </label>
            )}
          </div>
        )}

        <div className="flex gap-2"><button className="btn-primary flex-1">Guardar artigo</button><Link href="/admin/artigos" className="btn-ghost">Cancelar</Link></div>
      </div>
    </form>
  );
}
