import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ThemeSync from "@/components/ThemeSync";
import "./globals.css";

const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "Thekinoloji — O Teu Portal de Tecnologia", template: "%s | Thekinoloji" },
  description: "Notícias, reviews, tutoriais e tudo sobre tecnologia em Moçambique e no mundo.",
  icons: { icon: "/logo.png" },
};

// Aplica o tema guardado (ou o do sistema) antes da 1.ª pintura, para não piscar
const themeScript = `(function(){try{var t=localStorage.getItem("tk-theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}catch(e){}})()`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${body.variable}`}>
      <body className="font-sans"><ThemeSync />{children}</body>
    </html>
  );
}
