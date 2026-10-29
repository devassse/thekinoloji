import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteVideo, saveVideo } from "@/app/admin/actions";

export default async function VideosPage({ searchParams }: { searchParams: { erro?: string } }) {
  await requireRole("admin", "editor");
  const videos = await api.admin.videos();
  return (
    <>
      <PageHeader title="Vídeos" subtitle="Aparecem em “Últimos Vídeos da Playlist” na página inicial e na página /videos (do mais recente para o mais antigo)" />
      <Notice code={searchParams.erro} />

      <form action={saveVideo} className="card mb-6 grid items-end gap-3 p-5 md:grid-cols-[1.2fr_1.2fr_110px_auto_auto]">
        <div><label className="label" htmlFor="n-url">Link do YouTube *</label><input id="n-url" name="url" required placeholder="https://www.youtube.com/watch?v=…" className="field" /></div>
        <div><label className="label" htmlFor="n-title">Título *</label><input id="n-title" name="title" required className="field" /></div>
        <div><label className="label" htmlFor="n-dur">Duração</label><input id="n-dur" name="duration" placeholder="12:48" className="field" /></div>
        <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-brand" />Visível</label>
        <button className="btn-primary">Adicionar</button>
      </form>

      <div className="card divide-y divide-slate-200">
        {videos.map((v) => {
          const fid = `vid-${v.id}`;
          return (
            <div key={v.id} className="grid items-center gap-3 p-4 md:grid-cols-[112px_1.2fr_1.2fr_100px_auto_auto]">
              <img src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" className="aspect-video w-28 rounded-md bg-slate-200 object-cover" />
              <form id={fid} action={saveVideo} className="contents">
                <input type="hidden" name="id" value={v.id} />
                <input name="url" defaultValue={`https://youtu.be/${v.youtubeId}`} required aria-label="Link do YouTube" className="field" />
                <input name="title" defaultValue={v.title} required aria-label="Título" className="field" />
                <input name="duration" defaultValue={v.duration} aria-label="Duração" className="field" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={v.published} className="h-4 w-4 accent-brand" />Visível</label>
              </form>
              <div className="flex gap-2">
                <button form={fid} className="btn-ghost px-3 py-2">Guardar</button>
                <form action={deleteVideo}><input type="hidden" name="id" value={v.id} />
                  <ConfirmButton message="Eliminar este vídeo?" className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10"><Trash2 size={16} /></ConfirmButton></form>
              </div>
            </div>
          );
        })}
        {!videos.length && <p className="p-8 text-center text-sm text-slate-500">Ainda não há vídeos. Cole um link do YouTube acima.</p>}
      </div>
    </>
  );
}
