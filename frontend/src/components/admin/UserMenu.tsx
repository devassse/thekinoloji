"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut, UserCircle } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { ROLE_LABEL } from "./ui";

export default function UserMenu({ name, role, avatar }: { name: string; role: string; avatar: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const item = "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100";
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100">
        <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
        <span className="hidden text-left text-sm leading-tight sm:block">
          <span className="block font-semibold text-ink">{name}</span>
          <span className="block text-xs text-slate-500">{ROLE_LABEL[role]}</span>
        </span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-slate-200 bg-surface p-1.5 shadow-xl">
          <div className="px-3 py-2 sm:hidden"><div className="text-sm font-semibold text-ink">{name}</div><div className="text-xs text-slate-500">{ROLE_LABEL[role]}</div></div>
          <Link role="menuitem" href="/admin/perfil" onClick={() => setOpen(false)} className={item}><UserCircle size={16} />Meu perfil</Link>
          <Link role="menuitem" href="/" target="_blank" onClick={() => setOpen(false)} className={item}><ExternalLink size={16} />Ir ao site</Link>
          <div className="my-1 border-t border-slate-200" />
          <form action={logout}>
            <button role="menuitem" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-500/10"><LogOut size={16} />Terminar sessão</button>
          </form>
        </div>
      )}
    </div>
  );
}
