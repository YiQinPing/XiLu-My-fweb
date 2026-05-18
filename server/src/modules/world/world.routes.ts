import { Router } from "express";
import * as ctrl from "./world.controller";
import { authenticate } from "../../middleware/auth";

const router = Router({ mergeParams: true });
router.use(authenticate);

// 地点
router.get("/locations", ctrl.list);
router.post("/locations", ctrl.create);

// 势力
router.get("/factions", ctrl.factionList);
router.post("/factions", ctrl.factionCreate);

// 物品
router.get("/items", ctrl.itemList);
router.post("/items", ctrl.itemCreate);

export default router;
