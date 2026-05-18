import { Router } from "express";
import * as characterController from "./character.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get("/", characterController.list);
router.post("/", characterController.create);
router.get("/:id", characterController.getById);
router.patch("/:id", characterController.update);
router.delete("/:id", characterController.remove);

export default router;
