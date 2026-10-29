import { Router } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireRole } from "../auth";
import { asyncHandler } from "../http";

const r = Router();
r.use(requireRole("admin", "editor"));

r.get("/", asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const onlySms = req.query.sms === "1";
  const smsWhere: Prisma.SubscriberWhereInput = { smsConsent: true, phone: { not: null } };
  const where: Prisma.SubscriberWhereInput = {
    ...(onlySms ? smsWhere : {}),
    ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : {}),
  };
  const [items, total, withSms] = await Promise.all([
    prisma.subscriber.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: smsWhere }),
  ]);
  res.json({ items, total, withSms });
}));

const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`;

r.get("/export", asyncHandler(async (_req, res) => {
  const rows = (await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } }))
    .map((s) => [s.email, s.phone ?? "", s.smsConsent ? "sim" : "não", s.createdAt.toISOString()].map(cell).join(","));
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="subscritores.csv"');
  res.send("\ufeff" + ["email,telemovel,sms,subscrito_em", ...rows].join("\r\n"));
}));

r.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.subscriber.deleteMany({ where: { id: req.params.id } });
  res.status(204).end();
}));

export default r;
