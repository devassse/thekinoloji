import type { Settings } from "@prisma/client";
import { prisma } from "../db";
import { DEFAULT_SETTINGS } from "./defaults";

export async function getSettings(): Promise<Settings> {
  return (await prisma.settings.findUnique({ where: { id: 1 } })) ?? prisma.settings.create({ data: { id: 1, ...DEFAULT_SETTINGS } });
}

/** `full` includes the SMS fields (staff only). */
export function settingsDTO(s: Settings, full: boolean) {
  const { id: _id, facebook, x, instagram, youtube, whatsapp, linkedin, telegram, smsEnabled, smsTemplate, ...rest } = s;
  const base = { ...rest, shareNetworks: s.shareNetworks ?? [], socials: { facebook, x, instagram, youtube, whatsapp, linkedin, telegram } };
  return full ? { ...base, smsEnabled, smsTemplate } : base;
}
