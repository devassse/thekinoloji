import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { optionalAuth } from "../auth";
import { asyncHandler, HttpError } from "../http";
import { articleInclude, shape } from "../lib/serialize";
import { getSettings, settingsDTO } from "../lib/settings";
import { normalizePhone } from "../lib/sms";

const r = Router();

/** Settings + categories (menu, footer, newsletter…) */
r.get("/site", asyncHandler(async (_req, res) => {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ orderBy: [{ createdAt: "asc" }, { name: "asc" }] }),
  ]);
  res.json({ settings: settingsDTO(settings, false), categories });
}));

/** Published articles, newest first. ?category=slug (primary or extra)  ?q=text  ?limit=n */
r.get("/articles", asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const category = String(req.query.category ?? "").trim();
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
  const and: Prisma.ArticleWhereInput[] = [{ status: "published" }];
  if (category) and.push({ OR: [{ category: { slug: category } }, { extraCategories: { some: { category: { slug: category } } } }] });
  if (q) and.push({ OR: [
    { title: { contains: q, mode: "insensitive" } },
    { excerpt: { contains: q, mode: "insensitive" } },
    { category: { name: { contains: q, mode: "insensitive" } } },
    { tags: { has: q } },
  ] });
  const rows = await prisma.article.findMany({ where: { AND: and }, include: articleInclude, orderBy: { createdAt: "desc" }, take: limit });
  res.json(rows.map(shape));
}));

/** Drafts are only returned to signed-in staff (preview). */
r.get("/articles/:slug", optionalAuth, asyncHandler(async (req, res) => {
  const a = await prisma.article.findUnique({ where: { slug: req.params.slug }, include: articleInclude });
  if (!a || (a.status !== "published" && !req.user)) throw new HttpError(404, "nao-encontrado");
  res.json(shape(a));
}));

r.post("/articles/:slug/view", asyncHandler(async (req, res) => {
  await prisma.article.updateMany({ where: { slug: req.params.slug, status: "published" }, data: { views: { increment: 1 } } });
  res.status(204).end();
}));

/** Latest videos of the playlist */
r.get("/videos", asyncHandler(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 8));
  res.json(await prisma.video.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: limit }));
}));

const subLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: "demasiadas-tentativas" } });

r.post("/subscribe", subLimiter, asyncHandler(async (req, res) => {
  const p = z.object({
    email: z.string().trim().toLowerCase().email(),
    phone: z.string().trim().optional().default(""),
    sms: z.boolean().optional().default(false),
  }).safeParse(req.body);
  if (!p.success) throw new HttpError(400, "email-invalido");
  const { email, phone: raw, sms } = p.data;

  let phone: string | null = null;
  if (raw) {
    phone = normalizePhone(raw);
    if (!phone) throw new HttpError(400, "telefone-invalido");
    if (!sms) throw new HttpError(400, "consentimento");
  }
  await prisma.subscriber.upsert({
    where: { email },
    create: { email, phone, smsConsent: !!phone },
    update: phone ? { phone, smsConsent: true } : {},
  });
  res.json({ ok: true, sms: !!phone });
}));

export default r;
