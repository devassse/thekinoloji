import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import multer from "multer";
import { config } from "../config";
import { requireAuth } from "../auth";
import { asyncHandler } from "../http";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

/** Identify the image by its magic bytes (don't trust the client's content-type). */
function sniff(b: Buffer): "jpg" | "png" | "gif" | "webp" | null {
  if (b.length > 12) {
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
    if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return "png";
    if (b.toString("ascii", 0, 4) === "GIF8") return "gif";
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  }
  return null;
}

const r = Router();

r.post("/", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: "Máximo 5 MB. Use JPG, PNG, WebP ou GIF." });
    next();
  });
}, asyncHandler(async (req, res) => {
  const ext = req.file ? sniff(req.file.buffer) : null;
  if (!req.file || !ext) return res.status(400).json({ error: "Use JPG, PNG, WebP ou GIF." });
  await fs.mkdir(config.uploadDir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(config.uploadDir, name), req.file.buffer);
  res.json({ url: `/uploads/${name}` });
}));

export default r;
