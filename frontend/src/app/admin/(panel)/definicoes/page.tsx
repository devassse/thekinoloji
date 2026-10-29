import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { NETWORKS } from "@/lib/types";
import SocialIcon, { NETWORK_META } from "@/components/site/SocialIcon";
import { requireRole } from "@/lib/auth";
import { Notice, PageHeader } from "@/components/admin/ui";
import { saveSettings } from "../../actions";

export default async function SettingsPage({ searchParams }: { searchParams: { erro?: string } }) {
  const me = await requireRole("admin", "editor");
  if (me.role !== "admin") redirect("/admin/definicoes/categorias");
  const { settings: st, smsProvider } = await api.admin.settings();
  const Field = ({ name, label, value, wide = false }: { name: string; label: string; value: string; wide?: boolean }) => (
    <div className={wide ? "sm:col-span-2" : ""}><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} defaultValue={value} className="field" /></div>
  );
  return (
    <>
      <PageHeader title="Definições" subtitle="Parametrização geral do portal" />
      <Notice code={searchParams.erro} />
      <form action={saveSettings} className="max-w-3xl space-y-6">
        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-bold text-ink sm:col-span-2">Identidade</h2>
          <Field name="siteName" label="Nome do site" value={st.siteName} />
          <Field name="tagline" label="Slogan" value={st.tagline} />
          <Field name="city" label="Cidade (barra superior)" value={st.city} />
          <Field name="temperature" label="Temperatura" value={st.temperature} />
          <Field name="footerText" label="Texto do rodapé" value={st.footerText} wide />
        </section>
        <section className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-bold text-ink sm:col-span-2">Newsletter e tópicos</h2>
          <Field name="newsletterTitle" label="Título da newsletter" value={st.newsletterTitle} wide />
          <Field name="newsletterText" label="Texto da newsletter" value={st.newsletterText} wide />
          <Field name="popularTags" label="Tópicos populares (separados por vírgula)" value={st.popularTags.join(", ")} wide />
        </section>
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold text-ink">Notificações por SMS</h2>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="smsEnabled" defaultChecked={st.smsEnabled} className="h-4 w-4 accent-brand" />Permitir enviar SMS aos subscritores quando um artigo é publicado</label>
          <div>
            <label className="label" htmlFor="smsTemplate">Modelo da mensagem</label>
            <textarea id="smsTemplate" name="smsTemplate" rows={3} defaultValue={st.smsTemplate} className="field font-mono text-[13px]" />
            <p className="mt-1 text-xs text-slate-500">Use <code>{"{titulo}"}</code>, <code>{"{excerto}"}</code> e <code>{"{link}"}</code>. O excerto é cortado para a mensagem caber em cerca de 320 caracteres.</p>
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Fornecedor activo: <b>{smsProvider}</b>{smsProvider === "console" && " (modo de teste: as mensagens só aparecem no terminal da API)"}. As credenciais configuram-se no ficheiro <code>.env</code> do backend.</p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-base font-bold text-ink">Redes sociais</h2>
          <p className="mt-1 text-sm text-slate-500">Os mesmos canais aparecem no rodapé do site e, se marcados, nos botões de partilha no fim de cada artigo.</p>
          <div className="mt-4 divide-y divide-slate-200">
            {NETWORKS.map((n) => (
              <div key={n} className="grid items-center gap-3 py-3 sm:grid-cols-[150px_1fr_190px]">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink"><SocialIcon network={n} />{NETWORK_META[n].label}</span>
                <input name={`social_${n}`} defaultValue={st.socials[n]} aria-label={`Endereço do perfil ${NETWORK_META[n].label}`} placeholder="https://… (perfil)" className="field" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="shareNetworks" value={n} defaultChecked={st.shareNetworks.includes(n)} className="h-4 w-4 accent-brand" />{NETWORK_META[n].canShare ? "Botão de partilha" : "Botão (abre o perfil)"}</label>
              </div>
            ))}
          </div>
        </section>
        <button className="btn-primary">Guardar definições</button>
      </form>
    </>
  );
}
