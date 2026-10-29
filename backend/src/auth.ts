import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { prisma } from "./db";
import { config } from "./config";

export const safeUserSelect = { id: true, name: true, email: true, role: true, avatar: true, active: true, createdAt: true } as const;
export type SafeUser = { id: string; name: string; email: string; role: Role; avatar: string; active: boolean; createdAt: Date };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: SafeUser } }
}

export const signToken = (u: { id: string; role: Role }) => jwt.sign({ sub: u.id, role: u.role }, config.jwtSecret, { expiresIn: "8h" });

async function userFromHeader(header?: string): Promise<SafeUser | null> {
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const p = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    const u = await prisma.user.findUnique({ where: { id: p.sub }, select: safeUserSelect });
    return u && u.active ? u : null;
  } catch { return null; }
}

/** Attaches req.user when a valid token is sent; never rejects (public routes). */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  req.user = (await userFromHeader(req.headers.authorization)) ?? undefined;
  next();
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  const u = await userFromHeader(req.headers.authorization);
  if (!u) return res.status(401).json({ error: "nao-autenticado" });
  req.user = u;
  next();
};

export const requireRole = (...roles: Role[]): RequestHandler => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "sem-permissao" });
  next();
};
