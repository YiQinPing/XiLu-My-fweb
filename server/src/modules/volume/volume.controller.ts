import type { Request, Response, NextFunction } from "express";
import { createVolumeSchema, updateVolumeSchema } from "./volume.schema";
import * as volumeService from "./volume.service";

function getUserId(req: Request): string {
  return (req as any).userId;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await volumeService.list(getUserId(req), req.params.projectId);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createVolumeSchema.parse(req.body);
    const data = await volumeService.create(getUserId(req), req.params.projectId, input);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateVolumeSchema.parse(req.body);
    const data = await volumeService.update(getUserId(req), req.params.id, input);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await volumeService.remove(getUserId(req), req.params.id);
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}
