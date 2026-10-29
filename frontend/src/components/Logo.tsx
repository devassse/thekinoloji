export default function Logo({ size = 44, tagline = "O Teu Portal de Tecnologia", dark = true }: { size?: number; tagline?: string; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <img src="/logo.png" alt="" width={size} height={size} className="rounded-full" style={{ width: size, height: size }} />
      <span className="leading-tight">
        <span className={`block font-display text-xl font-bold ${dark ? "text-white" : "text-ink"}`}>Thekinoloji</span>
        {tagline && <span className={`block text-[11px] ${dark ? "text-white/60" : "text-muted"}`}>{tagline}</span>}
      </span>
    </span>
  );
}
