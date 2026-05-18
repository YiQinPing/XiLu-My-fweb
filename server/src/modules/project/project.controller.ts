import type { Request, Response, NextFunction } from "express";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import * as projectService from "./project.service";

function getUserId(req: Request): string {
  return (req as any).userId;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await projectService.list(getUserId(req));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createProjectSchema.parse(req.body);
    const data = await projectService.create(getUserId(req), input);
    res.status(201).json({ success: true, data });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
    }
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await projectService.getById(getUserId(req), req.params.id);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateProjectSchema.parse(req.body);
    const data = await projectService.update(getUserId(req), req.params.id, input);
    res.json({ success: true, data });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
    }
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.remove(getUserId(req), req.params.id);
    res.status(204).send();
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    next(err);
  }
}
