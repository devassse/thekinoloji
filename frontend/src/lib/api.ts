import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  ArticleInput, ArticleView, Category, CategoryWithCount, PublicSettings, Settings, SmsOutcome, Stats,
  Subscriber, User, UserWithCount, Video,
} from "./types";

export const API_URL = (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");
export const TOKEN_COOKIE = "tk_token";

/** `code` is the short error code sent by the API (e.g. "em-uso"); see MESSAGES in utils.ts */
export class ApiError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

type Opts = { method?: string; body?: unknown; auth?: boolean; soft?: boolean };

async function call<T>(path: string, o: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (o.body !== undefined) headers["Content-Type"] = "application/json";
  if (o.auth) {
    const t = cookies().get(TOKEN_COOKIE)?.value;
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: o.method ?? "GET", headers, cache: "no-store",
      body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
    });
  } catch {
    throw new ApiError(503, "servidor-indisponivel");
  }
  if (!res.ok) {
    if (res.status === 401 && o.auth && !o.soft) redirect("/admin/login"); // expired / invalid token
    let code = "erro";
    try { code = ((await res.json()) as { error?: string }).error ?? code; } catch {}
    throw new ApiError(res.status, code);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

const qs = (o: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};
const A = { auth: true } as const;

export const api = {
  /* ---------- public ---------- */
  site: cache(() => call<{ settings: PublicSettings; categories: Category[] }>("/api/public/site")),
  published: (p: { category?: string; q?: string } = {}) => call<ArticleView[]>(`/api/public/articles${qs(p)}`),
  article: cache((slug: string) => call<ArticleView>(`/api/public/articles/${encodeURIComponent(slug)}`, { auth: true, soft: true })),
  countView: (slug: string) => call<void>(`/api/public/articles/${encodeURIComponent(slug)}/view`, { method: "POST" }),
  videos: (limit = 8) => call<Video[]>(`/api/public/videos?limit=${limit}`),
  subscribe: (body: { email: string; phone: string; sms: boolean }) =>
    call<{ ok: true; sms: boolean }>("/api/public/subscribe", { method: "POST", body }),

  /* ---------- auth ---------- */
  login: (email: string, password: string) => call<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: { email, password } }),
  me: () => call<User>("/api/auth/me", { auth: true, soft: true }),
  updateMe: (body: { name: string; avatar: string; currentPassword: string; newPassword: string }) =>
    call<User>("/api/auth/me", { auth: true, method: "PUT", body }),

  /* ---------- backoffice ---------- */
  admin: {
    stats: () => call<Stats>("/api/admin/stats", A),
    authors: () => call<{ id: string; name: string }[]>("/api/admin/authors", A),
    smsInfo: () => call<{ enabled: boolean; recipients: number }>("/api/admin/sms-info", A),

    articles: (p: { q?: string; estado?: string } = {}) => call<ArticleView[]>(`/api/admin/articles${qs(p)}`, A),
    article: (id: string) => call<ArticleView>(`/api/admin/articles/${id}`, A),
    saveArticle: (id: string | undefined, body: ArticleInput) =>
      call<{ article: ArticleView; sms: SmsOutcome | null; smsError: boolean }>(id ? `/api/admin/articles/${id}` : "/api/admin/articles", { ...A, method: id ? "PUT" : "POST", body }),
    togglePublish: (id: string) => call<ArticleView>(`/api/admin/articles/${id}/toggle-publish`, { ...A, method: "POST" }),
    deleteArticle: (id: string) => call<void>(`/api/admin/articles/${id}`, { ...A, method: "DELETE" }),

    categories: () => call<CategoryWithCount[]>("/api/admin/categories", A),
    saveCategory: (id: string | undefined, body: { name: string; slug: string; color: string }) =>
      call<Category>(id ? `/api/admin/categories/${id}` : "/api/admin/categories", { ...A, method: id ? "PUT" : "POST", body }),
    deleteCategory: (id: string) => call<void>(`/api/admin/categories/${id}`, { ...A, method: "DELETE" }),

    users: () => call<UserWithCount[]>("/api/admin/users", A),
    user: (id: string) => call<User>(`/api/admin/users/${id}`, A),
    saveUser: (id: string | undefined, body: { name: string; email: string; role: string; avatar: string; active: boolean; password: string }) =>
      call<User>(id ? `/api/admin/users/${id}` : "/api/admin/users", { ...A, method: id ? "PUT" : "POST", body }),
    deleteUser: (id: string) => call<void>(`/api/admin/users/${id}`, { ...A, method: "DELETE" }),

    videos: () => call<Video[]>("/api/admin/videos", A),
    saveVideo: (id: string | undefined, body: { url: string; title: string; duration: string; published: boolean }) =>
      call<Video>(id ? `/api/admin/videos/${id}` : "/api/admin/videos", { ...A, method: id ? "PUT" : "POST", body }),
    deleteVideo: (id: string) => call<void>(`/api/admin/videos/${id}`, { ...A, method: "DELETE" }),

    subscribers: (p: { q?: string; sms?: boolean } = {}) =>
      call<{ items: Subscriber[]; total: number; withSms: number }>(`/api/admin/subscribers${qs({ q: p.q, sms: p.sms ? 1 : undefined })}`, A),
    deleteSubscriber: (id: string) => call<void>(`/api/admin/subscribers/${id}`, { ...A, method: "DELETE" }),

    settings: () => call<{ settings: Settings; smsProvider: string }>("/api/admin/settings", A),
    saveSettings: (body: unknown) => call<{ settings: Settings; smsProvider: string }>("/api/admin/settings", { ...A, method: "PUT", body }),
  },
};
