"use server";
import { api, ApiError } from "@/lib/api";

const MSG: Record<string, string> = {
  "email-invalido": "Introduza um email válido.",
  "telefone-invalido": "Número inválido. Exemplo: 84 123 4567",
  "consentimento": "Marque a caixa para aceitar receber SMS.",
  "demasiadas-tentativas": "Demasiadas tentativas. Tente mais tarde.",
};

export async function subscribe(_prev: { ok: boolean; msg: string } | null, f: FormData) {
  try {
    const r = await api.subscribe({
      email: String(f.get("email") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      sms: f.get("sms") === "on",
    });
    return { ok: true, msg: r.sms ? "Subscrição confirmada. Vais receber um SMS a cada novo artigo." : "Subscrição confirmada. Obrigado!" };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, msg: MSG[e.code] ?? "Não foi possível subscrever agora. Tente mais tarde." };
    throw e;
  }
}
