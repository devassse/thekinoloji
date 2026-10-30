"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

type Cat = { id: string; name: string; slug: string };

export default function SiteHeader({ tagline, categories }: { tagline: string; categories: Cat[] }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((was) => (was ? y > 20 : y > 80)); // hysteresis avoids flicker while the header resizes
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (y / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenu(false); }, [path]);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  // search is wide at the top of the page; once scrolled it shrinks to an icon and expands on click
  const expanded = !scrolled || open;
  const mobileFull = !scrolled || open;

  const isActive = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  const link = (href: string, label: string) => {
    const on = isActive(href);
    return (
      <Link href={href} aria-current={on ? "page" : undefined}
        className={`relative block whitespace-nowrap px-3 text-sm font-semibold transition-all duration-300 ${scrolled ? "py-2" : "py-3"} ${on ? "text-ink" : "text-body hover:text-ink"}
          after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:rounded-full after:bg-brand after:transition-transform after:duration-300
          ${on ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"}`}>
        {label}
      </Link>
    );
  };

  return (
    <header className={`sticky top-0 z-30 border-b transition-all duration-300 ${scrolled ? "border-line bg-surface/85 shadow-lg shadow-black/10 backdrop-blur-md" : "border-line bg-surface"}`}>
      <div className={`mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 max-[425px]:gap-x-2 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
        <Link href="/" className="flex min-w-0 items-center gap-3 max-[425px]:gap-2">
          <img src="/logo.png" alt="" className={`rounded-full transition-all duration-300 ${scrolled ? "h-8 w-8 max-[425px]:h-7 max-[425px]:w-7" : "h-11 w-11 max-[425px]:h-8 max-[425px]:w-8"}`} />
          <span className="leading-tight">
            <span className={`block font-display font-bold text-ink transition-all duration-300 ${scrolled ? "text-lg max-[425px]:text-[15px]" : "text-xl max-[425px]:text-base"}`}>Thekinoloji</span>
            <span className={`block overflow-hidden text-[11px] text-muted max-[425px]:text-[9px] transition-all duration-300 ${scrolled ? "max-h-0 opacity-0" : "max-h-4 max-[425px]:max-h-3 opacity-100"}`}>{tagline}</span>
          </span>
        </Link>

        <div className={`flex justify-center transition-all duration-300 md:order-none md:flex-1 ${mobileFull ? "order-3 w-full md:w-auto" : "ml-auto md:ml-0"}`}>
          <form action="/pesquisa" role="search"
            onSubmit={(e) => { if (!q.trim()) e.preventDefault(); }}
            style={{ width: expanded ? "100%" : 140, maxWidth: "36rem" }}
            className="flex h-10 overflow-hidden rounded-lg border border-line bg-surface2 transition-[width] duration-300 ease-out focus-within:border-brand/60">
            <input ref={input} name="q" value={q} onChange={(e) => setQ(e.target.value)} tabIndex={expanded ? 0 : -1}
              onBlur={() => { if (!q) setOpen(false); }}
              onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); input.current?.blur(); } }}
              placeholder="Pesquisar notícias, tutoriais, reviews…" aria-label="Pesquisar"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-ink placeholder:text-muted focus:outline-none" />
            <button type={expanded ? "submit" : "button"} aria-label={expanded ? "Pesquisar" : "Abrir pesquisa"}
              onClick={() => { if (!expanded) { setOpen(true); requestAnimationFrame(() => input.current?.focus()); } }}
              className="grid h-10 w-10 flex-none place-items-center bg-brand text-white hover:bg-brand-400"><Search size={16} /></button>
          </form>
        </div>

        <div className={`ml-auto flex items-center gap-2 max-[425px]:gap-1.5 md:ml-0 ${mobileFull ? "" : "hidden sm:flex"}`}>
     <a href="#newsletter" className={`rounded-lg bg-brand px-3 text-xs font-semibold text-white transition-all duration-300 hover:bg-brand-400 sm:px-4 sm:text-sm max-[425px]:px-2.5 max-[425px]:text-[11px] ${scrolled ? "py-1.5" : "py-2"}`}>Subscrever</a>
     <ThemeToggle />
   </div>
      </div>

      {/* Desktop: horizontal bar */}
      <nav className="hidden border-t border-line lg:block" aria-label="Categorias">
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
          <li>{link("/", "Início")}</li>
          {categories.map((c) => <li key={c.id}>{link(`/categoria/${c.slug}`, c.name)}</li>)}
        </ul>
      </nav>

      {/* Mobile / tablet: collapsible menu */}
      <nav className="border-t border-line lg:hidden" aria-label="Categorias">
        <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu"
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-2.5 text-sm font-semibold text-ink">
          <span className="inline-flex items-center gap-2"><Menu size={18} />{categories.find((c) => isActive(`/categoria/${c.slug}`))?.name ?? "Categorias"}</span>
          <ChevronDown size={18} className={`transition-transform duration-300 ${menu ? "rotate-180" : ""}`} />
        </button>
        <div id="mobile-menu" className={`grid transition-[grid-template-rows] duration-300 ease-out ${menu ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <ul className="mx-auto grid max-h-[65vh] max-w-7xl grid-cols-2 gap-2 overflow-y-auto px-4 pb-4 pt-1 sm:grid-cols-3 md:grid-cols-4">
              {[{ id: "home", name: "Início", href: "/" }, ...categories.map((c) => ({ id: c.id, name: c.name, href: `/categoria/${c.slug}` }))].map((i) => {
                const on = isActive(i.href);
                return (
                  <li key={i.id}>
                    <Link href={i.href} tabIndex={menu ? 0 : -1} aria-current={on ? "page" : undefined}
                      className={`block rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${on ? "border-brand bg-brand/10 text-ink" : "border-line bg-surface2 text-body hover:border-brand/50 hover:text-ink"}`}>
                      {i.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>

      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px">
        <div className="h-full bg-gradient-to-r from-brand to-brand-300 transition-[width] duration-150" style={{ width: `${progress}%`, opacity: scrolled ? 1 : 0 }} />
      </div>
    </header>
  );
}
