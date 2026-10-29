import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL, TOKEN_COOKIE } from "@/lib/api";

export async function POST(req: Request) {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  try {
    const r = await fetch(`${API_URL}/api/uploads`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: await req.formData() });
    const j = await r.json().catch(() => ({ error: "Falha no carregamento." }));
    return NextResponse.json(j, { status: r.status });
  } catch {
    return NextResponse.json({ error: "Não foi possível contactar a API." }, { status: 503 });
  }
}
