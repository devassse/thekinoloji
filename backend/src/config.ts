import "dotenv/config";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
if (isProd && jwtSecret === "dev-secret-change-me") throw new Error("Defina JWT_SECRET em produção.");

export const config = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  jwtSecret,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim()).filter(Boolean),
  siteUrl: (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || "uploads"),
  smsProvider: (process.env.SMS_PROVIDER || "console").toLowerCase(),
};
