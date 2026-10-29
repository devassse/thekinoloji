import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { config } from "../config";
import { requireRole } from "../auth";
import { asyncHandler, parse } from "../http";
import { getSettings, settingsDTO } from "../lib/settings";
import { DEFAULT_SMS_TEMPLATE } from "../lib/defaults";

const str = z.string().trim().optional().default("");
const Body = z.object({
  siteName: z.string().trim().min(1).default("Thekinoloji"),
  tagline: str, city: str, temperature: str, footerText: str, newsletterTitle: str, newsletterText: str,
  popularTags: z.array(z.string().trim()).optional().default([]),
  socials: z.object({ facebook: str, x: str, instagram: str, youtube: str, whatsapp: str, linkedin: str, telegram: str }).default({}),
  shareNetworks: z.array(z.enum(["facebook", "x", "instagram", "youtube", "whatsapp", "linkedin", "telegram"])).optional().default([]),
  smsEnabled: z.boolean().optional().default(false),
  smsTemplate: z.string().trim().optional().default(""),
});

const r = Router();
r.use(requireRole("admin"));

r.get("/", asyncHandler(async (_req, res) => {
  res.json({ settings: settingsDTO(await getSettings(), true), smsProvider: config.smsProvider });
}));

r.put("/", asyncHandler(async (req, res) => {
  const { socials, ...b } = parse(Body, req.body);
  const data = { ...b, ...socials, popularTags: b.popularTags.filter(Boolean), smsTemplate: b.smsTemplate || DEFAULT_SMS_TEMPLATE };
  const s = await prisma.settings.upsert({ where: { id: 1 }, create: { id: 1, ...data }, update: data });
  res.json({ settings: settingsDTO(s, true), smsProvider: config.smsProvider });
}));

export default r;
