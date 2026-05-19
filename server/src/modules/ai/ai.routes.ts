import { Router } from "express";
import * as aiController from "./ai.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/brainstorm", aiController.brainstorm);
router.post("/continuity-check", aiController.continuityCheck);
router.post("/style-assist", aiController.styleAssist);
router.post("/summarize", aiController.summarize);

export default router;
