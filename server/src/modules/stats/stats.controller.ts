import type { Request, Response } from "express";
import * as statsService from "./stats.service";
import * as analysisService from "./analysis.service";

export async function dailyStats(_req: Request, res: Response) {
  try {
    const { from, to } = _req.query;
    const fromDate = (from as string) || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate = (to as string) || new Date().toISOString().slice(0, 10);
    const stats = await statsService.getDailyStats(_req.params.projectId, fromDate, toDate);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    console.error("[Stats] dailyStats error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function summary(_req: Request, res: Response) {
  try {
    const data = await statsService.getSummary(_req.params.projectId);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("[Stats] summary error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function updateDaily(_req: Request, res: Response) {
  try {
    const { date, totalWords, netWords, writingTimeSec, goalWords } = _req.body;
    const stats = await statsService.upsertDailyStats(_req.params.projectId, {
      date,
      totalWords,
      netWords,
      writingTimeSec,
      goalWords,
    });
    res.json({ success: true, data: stats });
  } catch (err: any) {
    console.error("[Stats] updateDaily error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function startSession(_req: Request, res: Response) {
  try {
    const { chapterId } = _req.body;
    const session = await statsService.startWritingSession(_req.params.projectId, chapterId);
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function analyze(_req: Request, res: Response) {
  try {
    const result = await analysisService.analyzeChapters(_req.params.projectId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error("[Analysis] error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function endSession(_req: Request, res: Response) {
  try {
    const { wordsWritten, notes } = _req.body;
    const session = await statsService.endWritingSession(_req.params.id, { wordsWritten, notes });
    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}
