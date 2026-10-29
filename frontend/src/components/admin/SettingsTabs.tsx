"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsTabs({ role }: { role: string }) {
  const path = usePathname();
  const tabs = [
    { href: "/admin/definicoes", label: "Geral", roles: ["admin"], on: path === "/admin/definicoes" },
    { href: "/admin/definicoes/categorias", label: "Categorias", roles: ["admin", "editor"], on: path.startsWith("/admin/definicoes/categorias") },
    { href: "/admin/definicoes/utilizadores", label: "Utilizadores", roles: ["admin"], on: path.startsWith("/admin/definicoes/utilizadores") },
  ].filter((t) => t.roles.includes(role));
  return (
    <div className="mb-6 flex gap-1 border-b border-slate-200" role="tablist" aria-label="Definições">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} role="tab" aria-selected={t.on}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${t.on ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-ink"}`}>
          {t.label}
        </Link>
      ))}
    </div>
  );
}
