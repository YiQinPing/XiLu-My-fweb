import type { Request, Response } from "express";
import * as aiService from "./ai.service";
import { brainstormSchema, continuityCheckSchema, styleAssistSchema, summarizeSchema } from "./ai.schema";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getProjectTitle(projectId: string): Promise<string> {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { title: true } });
  return project?.title || "未命名作品";
}

export async function brainstorm(req: Request, res: Response) {
  try {
    const input = brainstormSchema.parse(req.body);
    const title = await getProjectTitle(req.params.projectId);
    const result = await aiService.brainstorm(title, input);
    res.json({ success: true, data: { result } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    console.error("[AI] brainstorm error:", err);
    res.status(500).json({ success: false, error: { code: "AI_ERROR", message: err?.message || "AI 服务暂时不可用" } });
  }
}

export async function continuityCheck(req: Request, res: Response) {
  try {
    const input = continuityCheckSchema.parse(req.body);
    const title = await getProjectTitle(req.params.projectId);
    const result = await aiService.continuityCheck(title, input);
    res.json({ success: true, data: { result } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    console.error("[AI] continuityCheck error:", err);
    res.status(500).json({ success: false, error: { code: "AI_ERROR", message: err?.message || "AI 服务暂时不可用" } });
  }
}

export async function styleAssist(req: Request, res: Response) {
  try {
    const input = styleAssistSchema.parse(req.body);
    const title = await getProjectTitle(req.params.projectId);
    const result = await aiService.styleAssist(title, input);
    res.json({ success: true, data: { result } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    console.error("[AI] styleAssist error:", err);
    res.status(500).json({ success: false, error: { code: "AI_ERROR", message: err?.message || "AI 服务暂时不可用" } });
  }
}

export async function summarize(req: Request, res: Response) {
  try {
    const input = summarizeSchema.parse(req.body);
    const title = await getProjectTitle(req.params.projectId);
    const result = await aiService.summarize(title, input);
    res.json({ success: true, data: { result } });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    console.error("[AI] summarize error:", err);
    res.status(500).json({ success: false, error: { code: "AI_ERROR", message: err?.message || "AI 服务暂时不可用" } });
  }
}
