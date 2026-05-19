import { Router } from "express";
import * as controller from "./inspiration.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get("/", controller.list);
router.get("/random-prompt", controller.randomPrompt);
router.post("/", controller.create);
router.get("/:id", controller.getById);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);
router.post("/:id/promote", controller.promote);

export default router;
