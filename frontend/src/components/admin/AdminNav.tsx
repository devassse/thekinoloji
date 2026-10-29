"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Mail, PlaySquare, Settings, Globe } from "lucide-react";

export default function AdminNav({ role, horizontal = false }: { role: string; horizontal?: boolean }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "editor", "author"], on: path === "/admin" },
    { href: "/admin/artigos", label: "Artigos", icon: FileText, roles: ["admin", "editor", "author"], on: path.startsWith("/admin/artigos") },
    { href: "/admin/videos", label: "Vídeos", icon: PlaySquare, roles: ["admin", "editor"], on: path.startsWith("/admin/videos") },
    { href: "/admin/subscritores", label: "Subscritores", icon: Mail, roles: ["admin", "editor"], on: path.startsWith("/admin/subscritores") },
    // editors only manage categories, so they land there
    { href: role === "admin" ? "/admin/definicoes" : "/admin/definicoes/categorias", label: "Definições", icon: Settings, roles: ["admin", "editor"], on: path.startsWith("/admin/definicoes") },
  ].filter((i) => i.roles.includes(role));
  return (
    <nav aria-label="Backoffice" className={horizontal ? "flex gap-1 overflow-x-auto" : "flex flex-col gap-1"}>
      {items.map(({ href, label, icon: Icon, on }) => (
        <Link key={label} href={href} aria-current={on ? "page" : undefined}
          className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${on ? "bg-brand text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
          <Icon size={18} />{label}
        </Link>
      ))}
      <Link href="/" target="_blank" className="flex items-center gap-3 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
        <Globe size={18} />Ver site
      </Link>
    </nav>
  );
}
