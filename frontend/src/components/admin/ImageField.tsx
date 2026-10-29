"use client";
import { useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { uploadImage } from "./upload";

/** URL input + "upload from this device" button. Submits the final URL under `name`. */
export default function ImageField({ name, label, defaultValue, round = false }: { name: string; label: string; defaultValue?: string; round?: boolean }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);

  const preview = url
    ? <img src={url} alt="" className={round ? "h-20 w-20 flex-none rounded-full object-cover" : "aspect-video w-full rounded-lg object-cover"} />
    : <span className={`grid place-items-center bg-slate-100 text-slate-400 ${round ? "h-20 w-20 flex-none rounded-full" : "aspect-video w-full rounded-lg"}`}><ImagePlus size={22} /></span>;

  const controls = (
    <div className="min-w-0 flex-1 space-y-2">
      <input id={name} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… ou carregue um ficheiro" className="field" />
      <div className="flex gap-2">
        <label className="btn-ghost flex-1 cursor-pointer">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}Carregar do dispositivo
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            setBusy(true); const u = await uploadImage(f); setBusy(false);
            if (u) setUrl(u);
            e.target.value = "";
          }} />
        </label>
        {url && <button type="button" onClick={() => setUrl("")} aria-label="Remover imagem" title="Remover" className="btn-ghost px-3"><Trash2 size={16} /></button>}
      </div>
    </div>
  );

  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      {round ? <div className="flex items-center gap-4">{preview}{controls}</div> : <div className="space-y-3">{preview}{controls}</div>}
    </div>
  );
}
