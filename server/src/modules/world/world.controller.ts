import type { Request, Response, NextFunction } from "express";
import { createLocationSchema, updateLocationSchema } from "./location.schema";
import * as svc from "./location.service";
import * as factionSvc from "./faction.service";
import * as itemSvc from "./item.service";

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
  try { res.status(201).json({ success: true, data: await svc.create(uid(req), { ...req.body, projectId: req.params.projectId }) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.update(uid(req), req.params.id, req.body) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await svc.remove(uid(req), req.params.id); res.status(204).send(); } catch (e: any) { handleErr(e, res, next); }
}

// Faction
export async function factionList(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await factionSvc.list(uid(req), req.params.projectId) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function factionCreate(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await factionSvc.create(uid(req), { ...req.body, projectId: req.params.projectId }) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function factionUpdate(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await factionSvc.update(uid(req), req.params.id, req.body) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function factionRemove(req: Request, res: Response, next: NextFunction) {
  try { await factionSvc.remove(uid(req), req.params.id); res.status(204).send(); } catch (e: any) { handleErr(e, res, next); }
}

// Item
export async function itemList(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await itemSvc.list(uid(req), req.params.projectId) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function itemCreate(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await itemSvc.create(uid(req), { ...req.body, projectId: req.params.projectId }) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function itemUpdate(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await itemSvc.update(uid(req), req.params.id, req.body) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function itemRemove(req: Request, res: Response, next: NextFunction) {
  try { await itemSvc.remove(uid(req), req.params.id); res.status(204).send(); } catch (e: any) { handleErr(e, res, next); }
}
