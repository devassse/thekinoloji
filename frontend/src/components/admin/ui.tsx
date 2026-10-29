import { MESSAGES } from "@/lib/utils";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function Notice({ code }: { code?: string }) {
  if (!code || !MESSAGES[code]) return null;
  const ok = code === "guardado" || code === "sms-ok";
  return (
    <p role="status" className={`mb-4 rounded-lg border px-4 py-2.5 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
      {MESSAGES[code]}
    </p>
  );
}

export function StatusChip({ status }: { status: "draft" | "published" }) {
  return status === "published"
    ? <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Publicado</span>
    : <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Rascunho</span>;
}

export const ROLE_LABEL: Record<string, string> = { admin: "Administrador", editor: "Editor", author: "Autor" };
