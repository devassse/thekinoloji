import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Recebe o "ping" do navegador e reencaminha à API com o IP, o User-Agent e (se for equipa) o token. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    slug?: unknown;
    vid?: unknown;
  };
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug || slug.length > 200)
    return new NextResponse(null, { status: 400 });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": req.headers.get("user-agent") ?? "",
  };
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  if (ip) headers["X-Forwarded-For"] = ip;
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (token) headers.Authorization = `Bearer ${token}`;

  await fetch(
    `${API_URL}/api/public/articles/${encodeURIComponent(slug)}/view`,
    {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        vid: typeof body.vid === "string" ? body.vid : "",
      }),
    },
  ).catch(() => {});
  return new NextResponse(null, { status: 204 });
}
