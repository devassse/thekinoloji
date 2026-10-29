import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "@/lib/api";

export async function GET() {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) return new Response("Forbidden", { status: 403 });
  const r = await fetch(`${API_URL}/api/admin/subscribers/export`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }).catch(() => null);
  if (!r || !r.ok) return new Response("Forbidden", { status: r?.status ?? 503 });
  return new Response(await r.text(), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="subscritores.csv"' } });
}
