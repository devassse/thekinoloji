import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import { config } from "./config";
import { prisma } from "./db";
import { errorHandler } from "./http";
import authRoutes from "./routes/auth";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/uploads";

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: "2mb" }));

fs.mkdirSync(config.uploadDir, { recursive: true });
app.use("/uploads", express.static(config.uploadDir, {
  index: false, maxAge: "365d", immutable: true,
  setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
}));

app.get("/health", async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false }); }
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((_req, res) => res.status(404).json({ error: "nao-encontrado" }));
app.use(errorHandler);

const server = app.listen(config.port, () => console.log(`API a correr em http://localhost:${config.port}`));
const stop = async () => { server.close(); await prisma.$disconnect(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
