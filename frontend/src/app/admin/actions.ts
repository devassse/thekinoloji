"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { api, ApiError } from "@/lib/api";
import { clearToken, requireRole, requireUser, setToken } from "@/lib/auth";
import { NETWORKS } from "@/lib/types";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const refresh = () => revalidatePath("/", "layout");
const withErr = (back: string, code: string) => `${back}${back.includes("?") ? "&" : "?"}erro=${encodeURIComponent(code)}`;

/** Runs an API call; on an API error redirects to `back?erro=<code>` (shown by <Notice/>). */
async function run<T>(fn: () => Promise<T>, back: string): Promise<T> {
  try { return await fn(); }
  catch (e) { if (e instanceof ApiError) redirect(withErr(back, e.code)); throw e; }
}

/* ---------- session ---------- */
export async function login(_p: { error?: string } | null, f: FormData) {
  try {
    const r = await api.login(s(f, "email"), String(f.get("password") ?? ""));
    setToken(r.token);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) return { error: "Email ou palavra-passe incorrectos." };
      if (e.code === "demasiadas-tentativas") return { error: "Demasiadas tentativas. Tente daqui a alguns minutos." };
    }
    return { error: "Não foi possível contactar o servidor. A API está a correr?" };
  }
  redirect("/admin");
}
export async function logout() {
  clearToken();
  redirect("/admin/login");
}

/* ---------- articles ---------- */
export async function saveArticle(f: FormData) {
  await requireUser();
  const id = s(f, "id");
  const back = id ? `/admin/artigos/${id}` : "/admin/artigos/novo";
  const title = s(f, "title");
  if (!title) redirect(withErr(back, "dados"));

  const r = await run(() => api.admin.saveArticle(id || undefined, {
    title, slug: s(f, "slug"), excerpt: s(f, "excerpt"), content: String(f.get("content") ?? ""), image: s(f, "image"),
    categoryId: s(f, "categoryId"),
    extraCategoryIds: f.getAll("extraCategoryIds").map(String),
    tags: s(f, "tags").split(",").map((t) => t.trim()).filter(Boolean),
    authorId: s(f, "authorId") || undefined,
    status: s(f, "status") === "published" ? "published" : "draft",
    featured: f.get("featured") === "on",
    notifySms: f.get("notifySms") === "on",
  }), back);

  let flag = "";
  if (r.smsError) flag = "sms-falhou";
  else if (r.sms && r.sms.sent > 0) flag = "sms-ok";
  else if (r.sms && r.sms.total > 0) flag = "sms-falhou";
  refresh();
  redirect(flag ? `/admin/artigos?erro=${flag}` : "/admin/artigos");
}

export async function togglePublish(f: FormData) {
  await requireRole("admin", "editor");
  await run(() => api.admin.togglePublish(s(f, "id")), "/admin/artigos");
  refresh();
  redirect("/admin/artigos");
}

export async function deleteArticle(f: FormData) {
  await requireRole("admin", "editor");
  await run(() => api.admin.deleteArticle(s(f, "id")), "/admin/artigos");
  refresh();
  redirect("/admin/artigos");
}

/* ---------- users ---------- */
export async function saveUser(f: FormData) {
  await requireRole("admin");
  const id = s(f, "id");
  const back = id ? `/admin/definicoes/utilizadores/${id}` : "/admin/definicoes/utilizadores/novo";
  await run(() => api.admin.saveUser(id || undefined, {
    name: s(f, "name"), email: s(f, "email"), role: s(f, "role"), avatar: s(f, "avatar"),
    active: f.get("active") === "on", password: String(f.get("password") ?? ""),
  }), back);
  refresh();
  redirect("/admin/definicoes/utilizadores");
}

export async function deleteUser(f: FormData) {
  await requireRole("admin");
  await run(() => api.admin.deleteUser(s(f, "id")), "/admin/definicoes/utilizadores");
  refresh();
  redirect("/admin/definicoes/utilizadores");
}

/* ---------- categories ---------- */
export async function saveCategory(f: FormData) {
  await requireRole("admin", "editor");
  const id = s(f, "id");
  if (!s(f, "name")) redirect(withErr("/admin/definicoes/categorias", "dados"));
  await run(() => api.admin.saveCategory(id || undefined, { name: s(f, "name"), slug: s(f, "slug"), color: s(f, "color") }), "/admin/definicoes/categorias");
  refresh();
  redirect("/admin/definicoes/categorias?erro=guardado");
}

export async function deleteCategory(f: FormData) {
  await requireRole("admin", "editor");
  await run(() => api.admin.deleteCategory(s(f, "id")), "/admin/definicoes/categorias");
  refresh();
  redirect("/admin/definicoes/categorias");
}

/* ---------- settings ---------- */
export async function saveSettings(f: FormData) {
  await requireRole("admin");
  await run(() => api.admin.saveSettings({
    siteName: s(f, "siteName"), tagline: s(f, "tagline"), city: s(f, "city"), temperature: s(f, "temperature"),
    footerText: s(f, "footerText"), newsletterTitle: s(f, "newsletterTitle"), newsletterText: s(f, "newsletterText"),
    popularTags: s(f, "popularTags").split(",").map((t) => t.trim()).filter(Boolean),
    socials: Object.fromEntries(NETWORKS.map((n) => [n, s(f, `social_${n}`)])),
    shareNetworks: f.getAll("shareNetworks").map(String),
    smsEnabled: f.get("smsEnabled") === "on",
    smsTemplate: String(f.get("smsTemplate") ?? "").trim(),
  }), "/admin/definicoes");
  refresh();
  redirect("/admin/definicoes?erro=guardado");
}

/* ---------- subscribers ---------- */
export async function deleteSubscriber(f: FormData) {
  await requireRole("admin", "editor");
  await run(() => api.admin.deleteSubscriber(s(f, "id")), "/admin/subscritores");
  redirect("/admin/subscritores");
}

/* ---------- own profile ---------- */
export async function saveProfile(f: FormData) {
  await requireUser();
  await run(() => api.updateMe({
    name: s(f, "name"), avatar: s(f, "avatar"),
    currentPassword: String(f.get("currentPassword") ?? ""), newPassword: String(f.get("newPassword") ?? ""),
  }), "/admin/perfil");
  refresh();
  redirect("/admin/perfil?erro=guardado");
}

/* ---------- videos ---------- */
export async function saveVideo(f: FormData) {
  await requireRole("admin", "editor");
  const id = s(f, "id");
  await run(() => api.admin.saveVideo(id || undefined, { url: s(f, "url"), title: s(f, "title"), duration: s(f, "duration"), published: f.get("published") === "on" }), "/admin/videos");
  refresh();
  redirect("/admin/videos?erro=guardado");
}

export async function deleteVideo(f: FormData) {
  await requireRole("admin", "editor");
  await run(() => api.admin.deleteVideo(s(f, "id")), "/admin/videos");
  refresh();
  redirect("/admin/videos");
}
