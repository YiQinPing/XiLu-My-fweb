import { Router } from "express";
import * as volumeController from "./volume.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", volumeController.list);
router.post("/", volumeController.create);
router.patch("/:id", volumeController.update);
router.delete("/:id", volumeController.remove);

export default router;
