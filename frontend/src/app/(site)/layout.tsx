import Link from "next/link";
import { Sun } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SocialIcon, { isRealUrl, NETWORK_META } from "@/components/site/SocialIcon";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";
import { NETWORKS } from "@/lib/types";
import { longToday } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings: st, categories } = await api.site();
  const socials = NETWORKS.filter((n) => !!st.socials[n]);
  return (
    <div className="min-h-screen bg-page text-body">
      <div className="border-b border-line bg-page text-[11px] text-muted">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="flex items-center gap-4">
            <span>{longToday()}</span>
            {/* <span className="inline-flex items-center gap-1"><Sun size={12} className="text-amber-500" />{st.city} {st.temperature}</span> */}
          </div>
          <div className="flex flex-wrap gap-2">
            {socials.map((n) => (
              <a key={n} href={isRealUrl(st.socials[n]) ? st.socials[n] : undefined} aria-label={NETWORK_META[n].label} target="_blank" rel="noopener noreferrer"
                className="grid h-6 w-6 place-items-center cursor-pointer rounded-full bg-surface2 text-body hover:bg-brand hover:text-white"><SocialIcon network={n} size={10} /></a>
            ))}
          </div>
        </div>
      </div>

      <SiteHeader tagline={st.tagline} categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))} />

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      <footer className="mt-10 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo tagline={st.tagline} dark={false} />
            <p className="max-w-xs text-sm text-muted">{st.footerText}</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((n) => (
                <a key={n} href={isRealUrl(st.socials[n]) ? st.socials[n] : undefined} aria-label={NETWORK_META[n].label} target="_blank" rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center cursor-pointer rounded-full bg-surface2 text-body hover:bg-brand hover:text-white"><SocialIcon network={n} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-bold text-ink">Categorias</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted">
              {categories.map((c) => <li key={c.id}><Link href={`/categoria/${c.slug}`} className="hover:text-ink">{c.name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-bold text-ink">{st.siteName}</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/pesquisa" className="hover:text-ink">Pesquisar</Link></li>
              <li><Link href="/videos" className="hover:text-ink">Vídeos</Link></li>
              <li><a href="#newsletter" className="hover:text-ink">Newsletter</a></li>
              <li><Link href="/admin" className="hover:text-ink">Backoffice</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-1 px-4 py-4 text-center text-xs text-muted sm:flex-row sm:justify-between sm:gap-3">
            <div>© {new Date().getFullYear()} {st.siteName}. Todos os direitos reservados.</div>
            <div>
              Desenvolvido com <span className="text-red-500">♥</span> por{" "}
              <a href="https://joaodevsonmucavel.vercel.app/" target="_blank" rel="noopener noreferrer"
                className="font-bold transition-colors hover:text-brand">Keoma Software, Inc.</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
