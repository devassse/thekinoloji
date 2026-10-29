import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db";
import { requireRole, safeUserSelect } from "../auth";
import { asyncHandler, HttpError, parse } from "../http";

const Base = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["admin", "editor", "author"]).default("author"),
  avatar: z.string().trim().optional().default(""),
  active: z.boolean().optional().default(true),
  password: z.string().optional().default(""),
});

const r = Router();
r.use(requireRole("admin"));

const activeAdmins = () => prisma.user.count({ where: { role: "admin", active: true } });

r.get("/", asyncHandler(async (_req, res) => {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { ...safeUserSelect, _count: { select: { articles: true } } } });
  res.json(rows.map(({ _count, ...u }) => ({ ...u, articleCount: _count.articles })));
}));

r.get("/:id", asyncHandler(async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id }, select: safeUserSelect });
  if (!u) throw new HttpError(404, "nao-encontrado");
  res.json(u);
}));

r.post("/", asyncHandler(async (req, res) => {
  const b = parse(Base, req.body);
  if (b.password.length < 6) throw new HttpError(400, "senha-curta");
  if (await prisma.user.findUnique({ where: { email: b.email } })) throw new HttpError(409, "email-existente");
  const u = await prisma.user.create({
    data: { name: b.name, email: b.email, role: b.role, active: b.active, passwordHash: await bcrypt.hash(b.password, 10), avatar: b.avatar || `https://i.pravatar.cc/120?u=${encodeURIComponent(b.email)}` },
    select: safeUserSelect,
  });
  res.status(201).json(u);
}));

r.put("/:id", asyncHandler(async (req, res) => {
  const b = parse(Base, req.body);
  const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new HttpError(404, "nao-encontrado");
  if (b.password && b.password.length < 6) throw new HttpError(400, "senha-curta");
  const clash = await prisma.user.findUnique({ where: { email: b.email } });
  if (clash && clash.id !== existing.id) throw new HttpError(409, "email-existente");
  if (existing.role === "admin" && (b.role !== "admin" || !b.active) && (await activeAdmins()) <= 1) throw new HttpError(409, "ultimo-admin");
  const u = await prisma.user.update({
    where: { id: existing.id },
    data: { name: b.name, email: b.email, role: b.role, active: b.active, avatar: b.avatar || existing.avatar, ...(b.password ? { passwordHash: await bcrypt.hash(b.password, 10) } : {}) },
    select: safeUserSelect,
  });
  res.json(u);
}));

r.delete("/:id", asyncHandler(async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) throw new HttpError(404, "nao-encontrado");
  if (u.id === req.user!.id) throw new HttpError(409, "proprio");
  if ((await prisma.article.count({ where: { authorId: u.id } })) > 0) throw new HttpError(409, "com-artigos");
  if (u.role === "admin" && (await activeAdmins()) <= 1) throw new HttpError(409, "ultimo-admin");
  await prisma.user.delete({ where: { id: u.id } });
  res.status(204).end();
}));

export default r;
