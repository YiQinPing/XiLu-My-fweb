import { Router } from "express";
import * as chapterController from "./chapter.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", chapterController.list);
router.post("/", chapterController.create);
router.get("/:id", chapterController.getById);
router.patch("/:id", chapterController.update);
router.delete("/:id", chapterController.remove);

export default router;
