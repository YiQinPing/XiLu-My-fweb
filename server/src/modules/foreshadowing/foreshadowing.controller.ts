import type { Request, Response, NextFunction } from "express";
import { createForeshadowingSchema, updateForeshadowingSchema } from "./foreshadowing.schema";
import * as svc from "./foreshadowing.service";

const uid = (r: Request) => (r as any).userId;
const handleErr = (err: any, res: Response, next: NextFunction) => {
  if (err.name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
  if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  next(err);
};

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.list(uid(req), req.params.projectId) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createForeshadowingSchema.parse({ ...req.body, projectId: req.params.projectId });
    res.status(201).json({ success: true, data: await svc.create(uid(req), input) });
  } catch (e: any) { handleErr(e, res, next); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateForeshadowingSchema.parse(req.body);
    res.json({ success: true, data: await svc.update(uid(req), req.params.id, input) });
  } catch (e: any) { handleErr(e, res, next); }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await svc.remove(uid(req), req.params.id); res.status(204).send(); } catch (e: any) { handleErr(e, res, next); }
}
