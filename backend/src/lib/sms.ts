/**
 * SMS sending. SMS_PROVIDER = console (default, dev) | africastalking | twilio.
 * Credentials come from environment variables only.
 */
export function normalizePhone(raw: string): string | null {
  let p = raw.replace(/[\s\-().]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  if (!p.startsWith("+")) p = "+" + (process.env.DEFAULT_COUNTRY_CODE || "258") + p.replace(/^0+/, "");
  return /^\+\d{8,15}$/.test(p) ? p : null;
}

export function buildSmsText(template: string, v: { titulo: string; excerto: string; link: string }): string {
  const max = Number(process.env.SMS_MAX_CHARS) || 320;
  const base = template.replace("{titulo}", v.titulo).replace("{link}", v.link).replace("{excerto}", "");
  const room = Math.max(0, max - base.length);
  const ex = v.excerto.length > room ? (room > 1 ? v.excerto.slice(0, room - 1).trimEnd() + "…" : "") : v.excerto;
  return template.replace("{titulo}", v.titulo).replace("{link}", v.link).replace("{excerto}", ex).trim();
}

export type SmsResult = { sent: number; failed: number };

export async function sendSms(to: string[], message: string): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER || "console").toLowerCase();
  if (provider === "africastalking") return africasTalking(to, message);
  if (provider === "twilio") return twilio(to, message);
  console.log(`[SMS:console] ${to.length} destinatário(s)\n${message}\n`);
  return { sent: to.length, failed: 0 };
}

async function africasTalking(to: string[], message: string): Promise<SmsResult> {
  const { AT_USERNAME, AT_API_KEY, AT_SENDER_ID } = process.env;
  if (!AT_USERNAME || !AT_API_KEY) throw new Error("AT_USERNAME / AT_API_KEY em falta");
  const base = AT_USERNAME === "sandbox" ? "https://api.sandbox.africastalking.com" : "https://api.africastalking.com";
  let sent = 0, failed = 0;
  for (let i = 0; i < to.length; i += 100) {
    const chunk = to.slice(i, i + 100);
    const body = new URLSearchParams({ username: AT_USERNAME, to: chunk.join(","), message });
    if (AT_SENDER_ID) body.set("from", AT_SENDER_ID);
    const r = await fetch(`${base}/version1/messaging`, {
      method: "POST", headers: { apiKey: AT_API_KEY, Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" }, body,
    });
    if (!r.ok) { failed += chunk.length; continue; }
    const j = (await r.json()) as { SMSMessageData?: { Recipients?: { statusCode: number }[] } };
    const ok = (j.SMSMessageData?.Recipients ?? []).filter((x) => x.statusCode === 101).length;
    sent += ok; failed += chunk.length - ok;
  }
  return { sent, failed };
}

async function twilio(to: string[], message: string): Promise<SmsResult> {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM: from, TWILIO_MESSAGING_SERVICE_SID: svc } = process.env;
  if (!sid || !token || !(from || svc)) throw new Error("Credenciais Twilio em falta");
  let sent = 0, failed = 0;
  for (let i = 0; i < to.length; i += 10) {
    const res = await Promise.all(to.slice(i, i + 10).map(async (n) => {
      const body = new URLSearchParams({ To: n, Body: message });
      if (svc) body.set("MessagingServiceSid", svc); else body.set("From", from as string);
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST", headers: { Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" }, body,
      });
      return r.ok;
    }));
    sent += res.filter(Boolean).length; failed += res.filter((x) => !x).length;
  }
  return { sent, failed };
}
