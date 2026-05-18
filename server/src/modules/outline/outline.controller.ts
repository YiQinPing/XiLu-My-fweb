import type { Request, Response, NextFunction } from "express";
import { createOutlineBeatSchema, updateOutlineBeatSchema } from "./outline.schema";
import * as outlineService from "./outline.service";

function uid(req: Request): string {
  return (req as any).userId;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await outlineService.list(uid(req), req.params.projectId);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createOutlineBeatSchema.parse(req.body);
    const data = await outlineService.create(uid(req), req.params.projectId, input);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateOutlineBeatSchema.parse(req.body);
    const data = await outlineService.update(uid(req), req.params.id, input);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await outlineService.remove(uid(req), req.params.id);
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}
