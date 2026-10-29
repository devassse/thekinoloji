import type { Config } from "tailwindcss";

// Colours backed by CSS variables (see globals.css) so everything follows the system light/dark setting.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#040a18", 900: "#071230", 800: "#0a1a3f", 700: "#0e2554", 600: "#14327a" },
        brand: { DEFAULT: "#1e6bff", 400: "#3d8bff", 300: "#19b5ff" },
        page: v("c-page"), surface: v("c-surface"), surface2: v("c-surface2"),
        ink: v("c-ink"), body: v("c-body"), muted: v("c-muted"), line: v("c-line"), link: v("c-link"),
        // the whole slate scale flips in dark mode (used by the backoffice)
        slate: { 50: v("s-50"), 100: v("s-100"), 200: v("s-200"), 300: v("s-300"), 400: v("s-400"), 500: v("s-500"), 600: v("s-600"), 700: v("s-700"), 800: v("s-800"), 900: v("s-900") },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
