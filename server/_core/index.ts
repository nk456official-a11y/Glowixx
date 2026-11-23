import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createUploadedPost } from "../db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  app.post(
    "/api/uploads/video",
    express.raw({ type: ["video/*", "application/octet-stream"], limit: "110mb" }),
    async (req, res) => {
      try {
        if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
          res.status(400).json({ error: "Выберите видеофайл для загрузки" });
          return;
        }
        if (req.body.length > 100 * 1024 * 1024) {
          res.status(413).json({ error: "Видео должно быть не больше 100 MB" });
          return;
        }

        const rawFilename = req.header("x-glowix-filename") || "glowix-video.mp4";
        const filename = decodeURIComponent(rawFilename).replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "glowix-video.mp4";
        const contentType = req.header("content-type") || "video/mp4";
        if (!contentType.startsWith("video/") && contentType !== "application/octet-stream") {
          res.status(415).json({ error: "Поддерживаются только видеофайлы" });
          return;
        }

        const stored = await storagePut(`videos/${Date.now()}-${filename}`, req.body, contentType);
        const post = await createUploadedPost({
          externalId: `upload-${nanoid(16)}`,
          creatorName: "Sasha Volkova",
          handle: "@sashavolkova",
          caption: "Новый момент, которым хочется поделиться ✦",
          tags: "#myglow  #newmoment",
          accent: "violet",
          posterUrl: null,
          videoUrl: stored.url,
        });

        res.status(201).json({ post, url: stored.url });
      } catch (error) {
        console.error("[Video upload] Failed:", error);
        res.status(500).json({ error: "Не удалось загрузить видео. Попробуйте ещё раз." });
      }
    },
  );
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });
