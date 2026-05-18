import type { Request, Response, NextFunction } from "express";
import { createCharacterSchema, updateCharacterSchema } from "./character.schema";
import * as characterService from "./character.service";

function uid(req: Request): string { return (req as any).userId; }

function handleZod(err: any, res: Response) {
  return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await characterService.list(uid(req), req.params.projectId);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createCharacterSchema.parse({ ...req.body, projectId: req.params.projectId });
    const data = await characterService.create(uid(req), input);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") return handleZod(err, res);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await characterService.getById(uid(req), req.params.id);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateCharacterSchema.parse(req.body);
    const data = await characterService.update(uid(req), req.params.id, input);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") return handleZod(err, res);
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await characterService.remove(uid(req), req.params.id);
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    next(err);
  }
}
