import express from "express";
import cors from "cors";
import { authenticate } from "./middleware/auth";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";
import volumeRoutes from "./modules/volume/volume.routes";
import * as volumeController from "./modules/volume/volume.controller";
import chapterRoutes from "./modules/chapter/chapter.routes";
import * as chapterController from "./modules/chapter/chapter.controller";
import outlineRoutes from "./modules/outline/outline.routes";
import * as outlineController from "./modules/outline/outline.controller";
import characterRoutes from "./modules/character/character.routes";
import * as characterController from "./modules/character/character.controller";
import worldRoutes from "./modules/world/world.routes";
import * as worldController from "./modules/world/world.controller";
import searchRoutes from "./modules/search/search.routes";
import relationshipRoutes from "./modules/relationship/relationship.routes";
import * as relationshipController from "./modules/relationship/relationship.controller";
import timelineRoutes from "./modules/timeline/timeline.routes";
import * as timelineController from "./modules/timeline/timeline.controller";
import foreshadowingRoutes from "./modules/foreshadowing/foreshadowing.routes";
import * as foreshadowingController from "./modules/foreshadowing/foreshadowing.controller";
import aiRoutes from "./modules/ai/ai.routes";
import inspirationRoutes from "./modules/inspiration/inspiration.routes";
import statsRoutes from "./modules/stats/stats.routes";

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
// 大纲路由
app.use("/api/v1/projects/:projectId/outline", outlineRoutes);
app.patch("/api/v1/outline/:id", authenticate, outlineController.update);
app.delete("/api/v1/outline/:id", authenticate, outlineController.remove);
// 人物路由
app.use("/api/v1/projects/:projectId/characters", characterRoutes);
app.get("/api/v1/characters/:id", authenticate, characterController.getById);
app.patch("/api/v1/characters/:id", authenticate, characterController.update);
app.delete("/api/v1/characters/:id", authenticate, characterController.remove);
// 世界观路由
app.use("/api/v1/projects/:projectId/world", worldRoutes);
app.patch("/api/v1/locations/:id", authenticate, worldController.update);
app.delete("/api/v1/locations/:id", authenticate, worldController.remove);
app.patch("/api/v1/factions/:id", authenticate, worldController.factionUpdate);
app.delete("/api/v1/factions/:id", authenticate, worldController.factionRemove);
app.patch("/api/v1/items/:id", authenticate, worldController.itemUpdate);
app.delete("/api/v1/items/:id", authenticate, worldController.itemRemove);
// 搜索
app.use("/api/v1/search", searchRoutes);
// 人物关系
app.use("/api/v1/projects/:projectId/relationships", relationshipRoutes);
app.patch("/api/v1/relationships/:id", authenticate, relationshipController.update);
app.delete("/api/v1/relationships/:id", authenticate, relationshipController.remove);
// 时间线
app.use("/api/v1/projects/:projectId/timelines", timelineRoutes);
app.patch("/api/v1/timelines/:id", authenticate, timelineController.updateTimeline);
app.delete("/api/v1/timelines/:id", authenticate, timelineController.removeTimeline);
app.patch("/api/v1/timeline-events/:id", authenticate, timelineController.updateEvent);
app.delete("/api/v1/timeline-events/:id", authenticate, timelineController.removeEvent);

// 伏笔
app.use("/api/v1/projects/:projectId/foreshadowings", foreshadowingRoutes);
app.patch("/api/v1/foreshadowings/:id", authenticate, foreshadowingController.update);
app.delete("/api/v1/foreshadowings/:id", authenticate, foreshadowingController.remove);
// AI
app.use("/api/v1/projects/:projectId/ai", aiRoutes);
// 灵感
app.use("/api/v1/projects/:projectId/inspirations", inspirationRoutes);
// 统计
app.use("/api/v1/projects/:projectId/stats", statsRoutes);

// 全局错误处理
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(_err);
  res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } });
});

app.listen(PORT, () => {
  console.log(`[server] 希陆Flow API 已启动 → http://localhost:${PORT}`);
});
