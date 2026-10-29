import { Bell, Search } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import UserMenu from "@/components/admin/UserMenu";
import Logo from "@/components/Logo";
import { requireUser } from "@/lib/auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-gradient-to-b from-navy-900 to-navy-950 p-4 lg:flex">
        <div className="mb-6 px-2 pt-2"><Logo tagline="Backoffice" /></div>
        <AdminNav role={me.role} />
        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
          <img src="/logo.png" alt="" className="mb-3 h-14 w-14 rounded-full opacity-90" />
          Conhecimento, tecnologia e comunidade. Juntos.
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-surface/90 backdrop-blur">
          <div className="flex items-center gap-4 px-4 py-3 lg:px-8">
            <div className="lg:hidden"><Logo size={34} tagline="" dark={false} /></div>
            <form action="/admin/artigos" className="relative ml-auto hidden w-full max-w-md md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" placeholder="Pesquisar artigos…" aria-label="Pesquisar artigos" className="field pl-9" />
            </form>
            <button aria-label="Notificações" className="relative ml-auto grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:bg-slate-100 md:ml-0">
              <Bell size={18} />
            </button>
            <UserMenu name={me.name} role={me.role} avatar={me.avatar} />
          </div>
          <div className="border-t border-slate-200 bg-navy-900 p-2 lg:hidden"><AdminNav role={me.role} horizontal /></div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
