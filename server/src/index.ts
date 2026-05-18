import express from "express";
import cors from "cors";
import { authenticate } from "./middleware/auth";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";
import volumeRoutes from "./modules/volume/volume.routes";
import * as volumeController from "./modules/volume/volume.controller";
import chapterRoutes from "./modules/chapter/chapter.routes";
import * as chapterController from "./modules/chapter/chapter.controller";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// 健康检查
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API v1 路由
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/projects/:projectId/volumes", volumeRoutes);
app.use("/api/v1/volumes/:volumeId/chapters", chapterRoutes);
// 单资源直接操作路由
app.patch("/api/v1/volumes/:id", authenticate, volumeController.update);
app.delete("/api/v1/volumes/:id", authenticate, volumeController.remove);
app.get("/api/v1/chapters/:id", authenticate, chapterController.getById);
app.patch("/api/v1/chapters/:id", authenticate, chapterController.update);
app.delete("/api/v1/chapters/:id", authenticate, chapterController.remove);

// 全局错误处理
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(_err);
  res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } });
});

app.listen(PORT, () => {
  console.log(`[server] 希陆Flow API 已启动 → http://localhost:${PORT}`);
});
