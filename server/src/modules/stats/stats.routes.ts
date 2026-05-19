import { Router } from "express";
import * as controller from "./stats.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get("/daily", controller.dailyStats);
router.get("/summary", controller.summary);
router.get("/analysis", controller.analyze);
router.post("/daily", controller.updateDaily);
router.post("/sessions/start", controller.startSession);
router.patch("/sessions/:id/end", controller.endSession);

export default router;
