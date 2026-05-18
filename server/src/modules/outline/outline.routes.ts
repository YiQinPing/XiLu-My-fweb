import { Router } from "express";
import * as outlineController from "./outline.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get("/", outlineController.list);
router.post("/", outlineController.create);
router.patch("/:id", outlineController.update);
router.delete("/:id", outlineController.remove);

export default router;
