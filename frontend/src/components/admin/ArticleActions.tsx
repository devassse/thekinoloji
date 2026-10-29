import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { ArticleView } from "@/lib/types";
import ConfirmButton from "./ConfirmButton";
import { deleteArticle, togglePublish } from "@/app/admin/actions";

const btn = "grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100";

export default function ArticleActions({ a, canManage }: { a: ArticleView; canManage: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <Link href={`/artigo/${a.slug}`} target="_blank" title="Abrir no site" aria-label="Abrir no site" className={btn}><ExternalLink size={16} /></Link>
      <Link href={`/admin/artigos/${a.id}`} title="Editar" aria-label="Editar" className={btn}><Pencil size={16} /></Link>
      {canManage && (
        <>
          <form action={togglePublish}><input type="hidden" name="id" value={a.id} />
            <button title={a.status === "published" ? "Despublicar" : "Publicar"} aria-label={a.status === "published" ? "Despublicar" : "Publicar"} className={btn}>
              {a.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </form>
          <form action={deleteArticle}><input type="hidden" name="id" value={a.id} />
            <ConfirmButton message="Eliminar este artigo?" className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></ConfirmButton>
          </form>
        </>
      )}
    </div>
  );
}
