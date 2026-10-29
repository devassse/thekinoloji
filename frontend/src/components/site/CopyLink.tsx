"use client";
import { useState } from "react";
import { Check, Link2 } from "lucide-react";

export default function CopyLink({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 2000); } catch {} }}
      className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:bg-surface2">
      {ok ? <Check size={16} /> : <Link2 size={16} />}{ok ? "Copiado" : "Copiar link"}
    </button>
  );
}
