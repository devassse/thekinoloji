import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { getSessionUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "Entrar — Backoffice" };

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900/80 to-brand/40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo size={52} />
          <div>
            <h2 className="max-w-md font-display text-4xl font-extrabold leading-tight text-white">Gerir o portal, sem complicações.</h2>
            <p className="mt-3 max-w-sm text-white/70">Publique artigos, organize categorias e controle quem tem acesso.</p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-100 p-6">
        <div className="card w-full max-w-sm p-8">
          <div className="mb-6 lg:hidden"><Logo dark={false} /></div>
          <h1 className="font-display text-2xl font-bold text-ink">Entrar no backoffice</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">Use a sua conta de equipa.</p>
          <LoginForm />
          {process.env.NODE_ENV !== "production" && (
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Demo: <b>admin@thekinoloji.co.mz</b> / <b>admin123</b></p>
          )}
          <Link href="/" className="mt-6 block text-center text-sm text-brand hover:underline">Voltar ao site</Link>
        </div>
      </section>
    </main>
  );
}
