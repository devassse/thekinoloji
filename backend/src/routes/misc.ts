import { Router } from "express";
import { prisma } from "../db";
import { requireRole } from "../auth";
import { asyncHandler } from "../http";
import { articleInclude, shape } from "../lib/serialize";
import { getSettings } from "../lib/settings";
import { smsRecipients } from "../lib/notify";

const r = Router();

/** Dashboard numbers + latest / most-read articles */
r.get("/stats", asyncHandler(async (_req, res) => {
  const [articles, published, users, activeUsers, categories, subscribers, smsSubscribers, recent, top] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "published" } }),
    prisma.user.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.category.count(),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { smsConsent: true, phone: { not: null } } }),
    prisma.article.findMany({ include: articleInclude, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.article.findMany({ where: { status: "published" }, include: articleInclude, orderBy: { views: "desc" }, take: 5 }),
  ]);
  res.json({ counts: { articles, published, drafts: articles - published, users, activeUsers, categories, subscribers, smsSubscribers }, recent: recent.map(shape), top: top.map(shape) });
}));

/** People that can be set as article author (article form) */
r.get("/authors", requireRole("admin", "editor"), asyncHandler(async (_req, res) => {
  res.json(await prisma.user.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }));
}));

r.get("/sms-info", asyncHandler(async (_req, res) => {
  const [settings, recipients] = await Promise.all([getSettings(), smsRecipients()]);
  res.json({ enabled: settings.smsEnabled, recipients: recipients.length });
}));

export default r;
