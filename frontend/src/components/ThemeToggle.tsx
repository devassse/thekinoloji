"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, currentTheme, saveTheme, watchSystemTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null); // null até montar (evita diferenças SSR/cliente)

  useEffect(() => {
    const t = currentTheme();
    applyTheme(t); setTheme(t);
    return watchSystemTheme(setTheme);
  }, []);

  const toggle = () => {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next); saveTheme(next); setTheme(next);
  };

  const label = theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro";
  return (
    <button type="button" onClick={toggle} aria-label={label} title={label}
      className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-line bg-surface2 text-body transition-colors hover:border-brand/60 hover:text-ink max-[425px]:h-8 max-[425px]:w-8">
      {theme === null ? null : theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}