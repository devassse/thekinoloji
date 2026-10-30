import Link from "next/link";
import type { User } from "@/lib/types";
import { saveUser } from "@/app/admin/actions";
import ImageField from "./ImageField";
import PasswordInput from "@/components/PasswordInput";

export default function UserForm({ user }: { user?: User }) {
  return (
    <form action={saveUser} className="card max-w-2xl space-y-4 p-6">
      <input type="hidden" name="id" defaultValue={user?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Nome *</label><input id="name" name="name" required defaultValue={user?.name} className="field" /></div>
        <div><label className="label" htmlFor="email">Email *</label><input id="email" name="email" type="email" required defaultValue={user?.email} className="field" /></div>
        <div><label className="label" htmlFor="role">Perfil</label>
          <select id="role" name="role" defaultValue={user?.role ?? "author"} className="field">
            <option value="admin">Administrador — acesso total</option>
            <option value="editor">Editor — artigos e categorias</option>
            <option value="author">Autor — os seus artigos</option>
          </select></div>
        <div><label className="label" htmlFor="password">{user ? "Nova palavra-passe" : "Palavra-passe *"}</label>
          <PasswordInput id="password" name="password" minLength={6} autoComplete="new-password" placeholder={user ? "Deixe em branco para manter" : ""} />
        </div>
      </div>
      <ImageField name="avatar" label="Foto" defaultValue={user?.avatar} round />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={user?.active ?? true} className="h-4 w-4 accent-brand" />Conta activa</label>
      <div className="flex gap-2"><button className="btn-primary">Guardar utilizador</button><Link href="/admin/definicoes/utilizadores" className="btn-ghost">Cancelar</Link></div>
    </form>
  );
}
