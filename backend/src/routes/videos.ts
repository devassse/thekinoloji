import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireRole } from "../auth";
import { asyncHandler, HttpError, parse } from "../http";
import { youtubeId } from "../lib/youtube";

const Body = z.object({
  url: z.string().trim().min(1),
  title: z.string().trim().min(1),
  duration: z.string().trim().max(12).optional().default(""),
  published: z.boolean().optional().default(true),
});

const r = Router();
r.use(requireRole("admin", "editor"));

r.get("/", asyncHandler(async (_req, res) => {
  res.json(await prisma.video.findMany({ orderBy: { createdAt: "desc" } }));
}));

r.post("/", asyncHandler(async (req, res) => {
  const b = parse(Body, req.body);
  const id = youtubeId(b.url);
  if (!id) throw new HttpError(400, "youtube-invalido");
  res.status(201).json(await prisma.video.create({ data: { title: b.title, youtubeId: id, duration: b.duration, published: b.published } }));
}));

r.put("/:id", asyncHandler(async (req, res) => {
  const b = parse(Body, req.body);
  const id = youtubeId(b.url);
  if (!id) throw new HttpError(400, "youtube-invalido");
  res.json(await prisma.video.update({ where: { id: req.params.id }, data: { title: b.title, youtubeId: id, duration: b.duration, published: b.published } }));
}));

r.delete("/:id", asyncHandler(async (req, res) => {
  await prisma.video.deleteMany({ where: { id: req.params.id } });
  res.status(204).end();
}));

export default r;
