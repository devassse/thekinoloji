export type Theme = "light" | "dark";
const KEY = "tk-theme";

export function storedTheme(): Theme | null {
  try { const v = localStorage.getItem(KEY); return v === "light" || v === "dark" ? v : null; } catch { return null; }
}
export function saveTheme(t: Theme) { try { localStorage.setItem(KEY, t); } catch {} }

/** Escolha guardada do visitante; se não houver, o tema do sistema. */
export function currentTheme(): Theme {
  return storedTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
}
/** Acompanha o sistema enquanto o visitante não escolheu. Devolve a função de limpeza. */
export function watchSystemTheme(onChange?: (t: Theme) => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const h = (e: MediaQueryListEvent) => {
    if (storedTheme()) return;
    const t: Theme = e.matches ? "dark" : "light";
    applyTheme(t); onChange?.(t);
  };
  mq.addEventListener("change", h);
  return () => mq.removeEventListener("change", h);
}