import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, TOKEN_COOKIE } from "./api";
import type { Role, User } from "./types";

/** The API issues an 8h JWT; we keep it in an httpOnly cookie and forward it as a Bearer token. */
export function setToken(token: string) {
  cookies().set(TOKEN_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8, secure: process.env.NODE_ENV === "production",
  });
}
export function clearToken() { cookies().delete(TOKEN_COOKIE); }

export const getSessionUser = cache(async (): Promise<User | null> => {
  if (!cookies().get(TOKEN_COOKIE)) return null;
  try { return await api.me(); } catch { return null; }
});

export async function requireUser(): Promise<User> {
  const u = await getSessionUser();
  if (!u) redirect("/admin/login");
  return u;
}
export async function requireRole(...roles: Role[]): Promise<User> {
  const u = await requireUser();
  if (!roles.includes(u.role)) redirect("/admin");
  return u;
}
