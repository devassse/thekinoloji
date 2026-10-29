import type { Network, PublicSettings } from "@/lib/types";
import CopyLink from "./CopyLink";
import SocialIcon, { isRealUrl, NETWORK_META } from "./SocialIcon";

/** Buttons come from Definições → Redes sociais (the same networks configured in the backoffice). */
export default function ShareBar({ url, title, settings }: { url: string; title: string; settings: PublicSettings }) {
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const share: Partial<Record<Network, string>> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    telegram: `https://t.me/share/url?url=${u}&text=${t}`,
  };
  const items = settings.shareNetworks.flatMap((n) => {
    const m = NETWORK_META[n];
    if (!m) return [];
    // Instagram / YouTube have no "share a link" URL: open the site's profile there instead
    const href = m.canShare ? share[n] : isRealUrl(settings.socials[n]) ? settings.socials[n] : undefined;
    return href ? [{ n, href, label: m.canShare ? m.label : `${m.label} (perfil)`, color: m.color }] : [];
  });
  return (
    <section aria-label="Partilhar" className="mt-10 border-t border-line pt-6">
      <h2 className="mb-3 font-display text-sm font-bold text-ink">Partilhar este artigo</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <a key={i.n} href={i.href} target="_blank" rel="noopener noreferrer" style={{ background: i.color }}
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
            <SocialIcon network={i.n} />{i.label}
          </a>
        ))}
        <CopyLink url={url} />
      </div>
    </section>
  );
}
