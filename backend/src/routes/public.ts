import { Router } from "express";
import { createHash } from "crypto";
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
r.get(
  "/site",
  asyncHandler(async (_req, res) => {
    const [settings, categories] = await Promise.all([
      getSettings(),
      prisma.category.findMany({
        orderBy: [{ createdAt: "asc" }, { name: "asc" }],
      }),
    ]);
    res.json({ settings: settingsDTO(settings, false), categories });
  }),
);

/** Published articles, newest first. ?category=slug (primary or extra)  ?q=text  ?limit=n */
r.get(
  "/articles",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    const category = String(req.query.category ?? "").trim();
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
    const and: Prisma.ArticleWhereInput[] = [{ status: "published" }];
    if (category)
      and.push({
        OR: [
          { category: { slug: category } },
          { extraCategories: { some: { category: { slug: category } } } },
        ],
      });
    if (q)
      and.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
          { tags: { has: q } },
        ],
      });
    const rows = await prisma.article.findMany({
      where: { AND: and },
      include: articleInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json(rows.map(shape));
  }),
);

/** Drafts are only returned to signed-in staff (preview). */
r.get(
  "/articles/:slug",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const a = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: articleInclude,
    });
    if (!a || (a.status !== "published" && !req.user))
      throw new HttpError(404, "nao-encontrado");
    res.json(shape(a));
  }),
);

// r.post("/articles/:slug/view", asyncHandler(async (req, res) => {
//   await prisma.article.updateMany({ where: { slug: req.params.slug, status: "published" }, data: { views: { increment: 1 } } });
//   res.status(204).end();
// }));
/* ---- Contagem de visualizações: ignora robôs e equipa, conta 1x por visitante/artigo a cada 6 h ---- */
const BOT_UA =
  /bot|crawl|spider|slurp|preview|scrape|headless|lighthouse|pingdom|uptime|monitor|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|axios|node-fetch|httpclient|okhttp|go-http|java\/|libwww|inspectiontool/i;
const VIEW_TTL_MS = 6 * 60 * 60 * 1000;
const seenViews = new Map<string, number>(); // chave (hash) -> expira em (ms). Em memória: reinicia com a API.
setInterval(
  () => {
    const now = Date.now();
    for (const [k, exp] of seenViews) if (exp < now) seenViews.delete(k);
  },
  10 * 60 * 1000,
).unref();
const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "demasiadas-tentativas" },
});

r.post(
  "/articles/:slug/view",
  viewLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const ua = String(req.headers["user-agent"] || "");
    if (req.user || !ua || BOT_UA.test(ua)) return res.status(204).end(); // equipa autenticada e robôs não contam

    const vid =
      typeof req.body?.vid === "string" &&
      /^[A-Za-z0-9-]{8,64}$/.test(req.body.vid)
        ? req.body.vid
        : "";
    const who = vid ? `v:${vid}` : `ip:${req.ip}|${ua}`; // id do visitante (ou IP+browser se não houver)
    const key = createHash("sha256")
      .update(`${who}|${req.params.slug}`)
      .digest("hex");
    const now = Date.now();
    if ((seenViews.get(key) ?? 0) > now) return res.status(204).end(); // já contado nas últimas 6 h
    if (seenViews.size > 100_000) seenViews.clear();
    seenViews.set(key, now + VIEW_TTL_MS);

    await prisma.article.updateMany({
      where: { slug: req.params.slug, status: "published" },
      data: { views: { increment: 1 } },
    });
    res.status(204).end();
  }),
);

/** Latest videos of the playlist */
r.get(
  "/videos",
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 8));
    res.json(
      await prisma.video.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    );
  }),
);

const subLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "demasiadas-tentativas" },
});

r.post(
  "/subscribe",
  subLimiter,
  asyncHandler(async (req, res) => {
    const p = z
      .object({
        email: z.string().trim().toLowerCase().email(),
        phone: z.string().trim().optional().default(""),
        sms: z.boolean().optional().default(false),
      })
      .safeParse(req.body);
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
  }),
);

export default r;
