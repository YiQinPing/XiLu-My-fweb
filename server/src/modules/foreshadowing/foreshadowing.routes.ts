import { Router } from "express";
import * as ctrl from "./foreshadowing.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get("/", ctrl.list);
router.post("/", ctrl.create);

export default router;
