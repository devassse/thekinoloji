"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
const KEY = "tk-theme";

const apply = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
};
const saved = (): Theme | null => {
  try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : null; } catch { return null; }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null); // null até montar (evita diferenças SSR/cliente)

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    // Enquanto o visitante não escolher, acompanha o tema do sistema em tempo real
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (saved()) return;
      const t: Theme = e.matches ? "dark" : "light";
      apply(t);
      setTheme(t);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(KEY, next); } catch {}
    setTheme(next);
  };

  const label = theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro";
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-line bg-surface2 text-body transition-colors hover:border-brand/60 hover:text-ink max-[425px]:h-8 max-[425px]:w-8">
      {theme === null ? null : theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}