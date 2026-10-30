import { requireUser } from "@/lib/auth";
import { Notice, PageHeader, ROLE_LABEL } from "@/components/admin/ui";
import ImageField from "@/components/admin/ImageField";
import { saveProfile } from "@/app/admin/actions";
import PasswordInput from "@/components/PasswordInput";

export const metadata = { title: "O meu perfil" };

export default async function ProfilePage({ searchParams }: { searchParams: { erro?: string } }) {
  const me = await requireUser();
  return (
    <>
      <PageHeader title="O meu perfil" subtitle={`${me.email} · ${ROLE_LABEL[me.role]}`} />
      <Notice code={searchParams.erro} />
      <form action={saveProfile} className="max-w-2xl space-y-6">
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold text-ink">Dados pessoais</h2>
          <ImageField name="avatar" label="Foto" defaultValue={me.avatar} round />
          <div><label className="label" htmlFor="name">Nome</label><input id="name" name="name" required defaultValue={me.name} className="field" /></div>
        </section>
        <section className="card space-y-4 p-6">
          <h2 className="font-display text-base font-bold text-ink">Alterar palavra-passe</h2>
          <p className="text-sm text-slate-500">Deixe em branco para manter a actual.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="currentPassword">Palavra-passe actual</label><PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" /></div>
            <div><label className="label" htmlFor="newPassword">Nova palavra-passe</label><PasswordInput id="newPassword" name="newPassword" minLength={6} autoComplete="new-password" /></div>
          </div>
        </section>
        <button className="btn-primary">Guardar perfil</button>
      </form>
    </>
  );
}
