import type { Request, Response, NextFunction } from "express";
import * as svc from "./search.service";

const uid = (r: Request) => (r as any).userId;

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || "";
    const projectId = req.query.projectId as string;
    if (!q.trim()) return res.json({ success: true, data: [] });
    if (!projectId) return res.status(400).json({ success: false, error: { code: "MISSING_PARAM", message: "请指定作品" } });
    const results = await svc.search(uid(req), projectId, q.trim());
    res.json({ success: true, data: results });
  } catch (e: any) {
    next(e);
  }
}
