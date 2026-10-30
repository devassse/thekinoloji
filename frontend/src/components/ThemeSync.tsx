"use client";
import { useEffect } from "react";
import { applyTheme, currentTheme, watchSystemTheme } from "@/lib/theme";

/** Rede de segurança: depois da hidratação, volta a aplicar o tema guardado (ou o do sistema). */
export default function ThemeSync() {
  useEffect(() => { applyTheme(currentTheme()); return watchSystemTheme(); }, []);
  return null;
}