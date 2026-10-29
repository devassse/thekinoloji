import { Router, type Request, type Response } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireRole } from "../auth";
import { asyncHandler, HttpError, parse } from "../http";
import { articleInclude, shape } from "../lib/serialize";
import { clean, stripHtml } from "../lib/content";
import { slugify, uniqueArticleSlug } from "../lib/slug";
import { getSettings } from "../lib/settings";
import { notifyNewArticle } from "../lib/notify";

const imageUrl = z.string().trim().optional().default("").transform((v) => (/^(https?:\/\/|\/uploads\/)/.test(v) ? v : ""));
const Body = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().optional().default(""),
  excerpt: z.string().optional().default(""),
  content: z.string().optional().default(""),
  image: imageUrl,
  categoryId: z.string().min(1),                       // primary category
  extraCategoryIds: z.array(z.string()).optional().default([]), // additional categories
  tags: z.array(z.string().trim()).optional().default([]),
  authorId: z.string().optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  featured: z.boolean().optional().default(false),
  notifySms: z.boolean().optional().default(false),
});

const r = Router();

r.get("/", asyncHandler(async (req, res) => {
  const me = req.user!;
  const q = String(req.query.q ?? "").trim();
  const estado = req.query.estado === "published" || req.query.estado === "draft" ? req.query.estado : undefined;
  const and: Prisma.ArticleWhereInput[] = [];
  if (me.role === "author") and.push({ authorId: me.id });
  if (estado) and.push({ status: estado });
  if (q) and.push({ OR: [
    { title: { contains: q, mode: "insensitive" } },
    { category: { name: { contains: q, mode: "insensitive" } } },
    { author: { name: { contains: q, mode: "insensitive" } } },
  ] });
  const rows = await prisma.article.findMany({ where: { AND: and }, include: articleInclude, orderBy: { createdAt: "desc" } });
  res.json(rows.map(shape));
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const a = await prisma.article.findUnique({ where: { id: req.params.id }, include: articleInclude });
  if (!a) throw new HttpError(404, "nao-encontrado");
  if (req.user!.role === "author" && a.authorId !== req.user!.id) throw new HttpError(403, "sem-permissao");
  res.json(shape(a));
}));

async function save(req: Request, res: Response, id?: string) {
  const me = req.user!;
  const body = parse(Body, req.body);
  const existing = id ? await prisma.article.findUnique({ where: { id } }) : null;
  if (id && !existing) throw new HttpError(404, "nao-encontrado");
  if (existing && me.role === "author" && existing.authorId !== me.id) throw new HttpError(403, "sem-permissao");

  const extraIds = Array.from(new Set(body.extraCategoryIds.filter((c) => c && c !== body.categoryId)));
  const found = await prisma.category.count({ where: { id: { in: [body.categoryId, ...extraIds] } } });
  if (found !== extraIds.length + 1) throw new HttpError(400, "categoria-invalida");

  const canPublish = me.role !== "author";
  let authorId = me.id;
  if (canPublish && body.authorId && (await prisma.user.findUnique({ where: { id: body.authorId }, select: { id: true } }))) authorId = body.authorId;

  const content = clean(body.content);
  const data = {
    title: body.title,
    slug: await uniqueArticleSlug(slugify(body.slug || body.title), id),
    excerpt: body.excerpt.trim() || stripHtml(content).slice(0, 180),
    content,
    image: body.image,
    categoryId: body.categoryId,
    authorId,
    tags: body.tags.filter(Boolean),
    status: canPublish ? body.status : existing?.status ?? "draft",
    featured: canPublish && body.featured,
  };
  const links = extraIds.map((categoryId) => ({ categoryId }));
  let article = existing
    ? await prisma.article.update({ where: { id: existing.id }, data: { ...data, extraCategories: { deleteMany: {}, create: links } } })
    : await prisma.article.create({ data: { ...data, extraCategories: { create: links } } });

  // SMS to subscribers — once per article, only when explicitly requested
  let sms: { sent: number; failed: number; total: number } | null = null;
  let smsError = false;
  if (article.status === "published" && canPublish && body.notifySms && !article.notifiedAt) {
    const settings = await getSettings();
    if (settings.smsEnabled) {
      try {
        sms = await notifyNewArticle(article, settings.smsTemplate);
        if (sms.sent > 0) article = await prisma.article.update({ where: { id: article.id }, data: { notifiedAt: new Date(), notifiedCount: sms.sent } });
      } catch (e) {
        console.error("SMS error:", e);
        smsError = true;
      }
    }
  }
  const full = await prisma.article.findUniqueOrThrow({ where: { id: article.id }, include: articleInclude });
  res.json({ article: shape(full), sms, smsError });
}

r.post("/", asyncHandler((req, res) => save(req, res)));
r.put("/:id", asyncHandler((req, res) => save(req, res, req.params.id)));

r.post("/:id/toggle-publish", requireRole("admin", "editor"), asyncHandler(async (req, res) => {
  const a = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!a) throw new HttpError(404, "nao-encontrado");
  res.json(shape(await prisma.article.update({ where: { id: a.id }, data: { status: a.status === "published" ? "draft" : "published" }, include: articleInclude })));
}));

r.delete("/:id", requireRole("admin", "editor"), asyncHandler(async (req, res) => {
  await prisma.article.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

export default r;
