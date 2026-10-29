"use client";
import { useFormState, useFormStatus } from "react-dom";
import { Mail } from "lucide-react";
import { subscribe } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-white/90 disabled:opacity-60">
      {pending ? "A enviar…" : "Subscrever"}
    </button>
  );
}

const input = "w-full rounded-lg border border-white/20 bg-white px-3 py-2.5 text-sm text-navy-900 placeholder:text-slate-400";

export default function Newsletter({ title, text, compact = false, id = "newsletter" }: { title: string; text: string; compact?: boolean; id?: string }) {
  const [state, action] = useFormState(subscribe, null);
  return (
    <div id={id} className={`scroll-mt-32 rounded-xl bg-gradient-to-br from-brand to-navy-700 text-white ${compact ? "p-5" : "p-7 text-center"}`}>
      {!compact && <Mail className="mx-auto mb-3" size={28} />}
      <h3 className={`font-display font-bold ${compact ? "text-base" : "text-xl"}`}>{title}</h3>
      <p className="mt-1 text-sm text-white/80">{text}</p>
      <form action={action} className="mt-4 space-y-2 text-left">
        <input name="email" type="email" required placeholder="O teu email" aria-label="Email" className={input} />
        <input name="phone" type="tel" inputMode="tel" placeholder="Telemóvel (opcional) — 84 123 4567" aria-label="Telemóvel" className={input} />
        <label className="flex items-start gap-2 text-xs text-white/85">
          <input type="checkbox" name="sms" className="mt-0.5 h-4 w-4 accent-white" />
          <span>Quero receber um SMS quando for publicado um novo artigo.</span>
        </label>
        <Submit />
        {state && <p role="status" className={`text-xs ${state.ok ? "text-emerald-200" : "text-amber-200"}`}>{state.msg}</p>}
      </form>
    </div>
  );
}
