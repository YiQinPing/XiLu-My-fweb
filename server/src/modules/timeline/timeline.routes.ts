import { Router } from "express";
import * as ctrl from "./timeline.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

// Timeline CRUD
router.get("/", ctrl.listTimelines);
router.post("/", ctrl.createTimeline);

// TimelineEvent CRUD (nested under a timeline)
const eventRouter = Router({ mergeParams: true });
eventRouter.use(authenticate);
eventRouter.get("/", ctrl.listEvents);
eventRouter.post("/", ctrl.createEvent);
router.use("/:timelineId/events", eventRouter);

export default router;
