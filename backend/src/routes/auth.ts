import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../db";
import { asyncHandler, HttpError, parse } from "../http";
import { requireAuth, safeUserSelect, signToken } from "../auth";

const r = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: "demasiadas-tentativas" } });

r.post("/login", limiter, asyncHandler(async (req, res) => {
  const { email, password } = parse(z.object({ email: z.string().trim().toLowerCase(), password: z.string().min(1) }), req.body);
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !u.active || !(await bcrypt.compare(password, u.passwordHash))) throw new HttpError(401, "credenciais-invalidas");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: u.id }, select: safeUserSelect });
  res.json({ token: signToken(u), user });
}));

r.get("/me", requireAuth, (req, res) => { res.json(req.user); });

/** Edit own profile: name, photo and (optionally) password */
r.put("/me", requireAuth, asyncHandler(async (req, res) => {
  const b = parse(z.object({
    name: z.string().trim().min(1),
    avatar: z.string().trim().optional().default(""),
    currentPassword: z.string().optional().default(""),
    newPassword: z.string().optional().default(""),
  }), req.body);
  const me = req.user!;
  const data: { name: string; avatar?: string; passwordHash?: string } = { name: b.name };
  if (b.avatar && /^(https?:\/\/|\/uploads\/)/.test(b.avatar)) data.avatar = b.avatar;
  if (b.newPassword) {
    if (b.newPassword.length < 6) throw new HttpError(400, "senha-curta");
    const u = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
    if (!(await bcrypt.compare(b.currentPassword, u.passwordHash))) throw new HttpError(400, "senha-actual-invalida");
    data.passwordHash = await bcrypt.hash(b.newPassword, 10);
  }
  res.json(await prisma.user.update({ where: { id: me.id }, data, select: safeUserSelect }));
}));

export default r;
