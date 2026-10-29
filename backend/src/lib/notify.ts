import { prisma } from "../db";
import { config } from "../config";
import { buildSmsText, sendSms } from "./sms";

export async function smsRecipients(): Promise<string[]> {
  const subs = await prisma.subscriber.findMany({ where: { smsConsent: true, phone: { not: null } }, select: { phone: true } });
  return Array.from(new Set(subs.map((s) => s.phone as string)));
}

export async function notifyNewArticle(a: { title: string; excerpt: string; slug: string }, template: string) {
  const phones = await smsRecipients();
  if (!phones.length) return { sent: 0, failed: 0, total: 0 };
  const text = buildSmsText(template, { titulo: a.title, excerto: a.excerpt, link: `${config.siteUrl}/artigo/${a.slug}` });
  const r = await sendSms(phones, text);
  return { ...r, total: phones.length };
}
