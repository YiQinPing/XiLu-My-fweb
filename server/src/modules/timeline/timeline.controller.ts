import type { Request, Response, NextFunction } from "express";
import * as svc from "./timeline.service";
import { createTimelineSchema, updateTimelineSchema, createTimelineEventSchema, updateTimelineEventSchema } from "./timeline.schema";

const uid = (r: Request) => (r as any).userId;
const handleErr = (err: any, res: Response, next: NextFunction) => {
  if (err.name === "ZodError") return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors } });
  if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  next(err);
};

// Timeline
export async function listTimelines(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.listTimelines(uid(req), req.params.projectId) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function createTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createTimelineSchema.parse({ ...req.body, projectId: req.params.projectId });
    res.status(201).json({ success: true, data: await svc.createTimeline(uid(req), input) });
  } catch (e: any) { handleErr(e, res, next); }
}
export async function updateTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateTimelineSchema.parse(req.body);
    res.json({ success: true, data: await svc.updateTimeline(uid(req), req.params.id, input) });
  } catch (e: any) { handleErr(e, res, next); }
}
export async function removeTimeline(req: Request, res: Response, next: NextFunction) {
  try { await svc.removeTimeline(uid(req), req.params.id); res.status(204).send(); } catch (e: any) { handleErr(e, res, next); }
}

// TimelineEvent
export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await svc.listEvents(uid(req), req.params.timelineId) }); } catch (e: any) { handleErr(e, res, next); }
}
export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createTimelineEventSchema.parse({ ...req.body, projectId: req.params.projectId, timelineId: req.params.timelineId });
    res.status(201).json({ success: true, data: await svc.createEvent(uid(req), input) });
  } catch (e: any) { handleErr(e, res, next); }
}
export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateTimelineEventSchema.parse(req.body);
    res.json({ success: true, data: await svc.updateEvent(uid(req), req.params.id, input) });
  } catch (e: any) { handleErr(e, res, next); }
}
export async function removeEvent(req: Request, res: Response, next: NextFunction) {
  try { await svc.removeEvent(uid(req), req.params.id); res.status(204).send(); } catch (e: any) { handleErr(e, res, next); }
}
