import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireRole } from "../auth";
import { asyncHandler, HttpError, parse } from "../http";
import { slugify, uniqueCategorySlug } from "../lib/slug";

const Body = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().optional().default(""),
  color: z.string().trim().optional().default("#1e6bff").transform((v) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#1e6bff")),
});

const r = Router();

r.get("/", asyncHandler(async (_req, res) => {
  const rows = await prisma.category.findMany({ orderBy: [{ createdAt: "asc" }, { name: "asc" }], include: { _count: { select: { articles: true, articleLinks: true } } } });
  res.json(rows.map(({ _count, ...c }) => ({ ...c, articleCount: _count.articles + _count.articleLinks })));
}));

r.post("/", requireRole("admin", "editor"), asyncHandler(async (req, res) => {
  const b = parse(Body, req.body);
  res.status(201).json(await prisma.category.create({ data: { name: b.name, color: b.color, slug: await uniqueCategorySlug(slugify(b.slug || b.name)) } }));
}));

r.put("/:id", requireRole("admin", "editor"), asyncHandler(async (req, res) => {
  const b = parse(Body, req.body);
  res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name: b.name, color: b.color, slug: await uniqueCategorySlug(slugify(b.slug || b.name), req.params.id) } }));
}));

r.delete("/:id", requireRole("admin", "editor"), asyncHandler(async (req, res) => {
  const used = (await prisma.article.count({ where: { categoryId: req.params.id } })) + (await prisma.articleCategory.count({ where: { categoryId: req.params.id } }));
  if (used > 0) throw new HttpError(409, "em-uso");
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

export default r;
