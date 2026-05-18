import { Router } from "express";
import * as projectController from "./project.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", projectController.list);
router.post("/", projectController.create);
router.get("/:id", projectController.getById);
router.patch("/:id", projectController.update);
router.delete("/:id", projectController.remove);

export default router;
