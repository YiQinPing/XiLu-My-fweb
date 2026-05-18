import { Router } from "express";
import * as ctrl from "./search.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
router.use(authenticate);
router.get("/", ctrl.search);

export default router;
