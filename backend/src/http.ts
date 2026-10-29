import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Prisma } from "@prisma/client";
import { z, type ZodTypeAny } from "zod";

/** `code` is a short machine-readable string the frontend maps to a message. */
export class HttpError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };

export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const r = schema.safeParse(data);
  if (!r.success) throw new HttpError(400, "dados");
  return r.data;
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.code });
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return res.status(409).json({ error: "duplicado" });
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") return res.status(404).json({ error: "nao-encontrado" });
  console.error(err);
  return res.status(500).json({ error: "erro-interno" });
};
