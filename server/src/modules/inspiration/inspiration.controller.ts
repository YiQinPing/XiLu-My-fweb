import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import * as service from "./inspiration.service";
import { createInspirationSchema, updateInspirationSchema, promoteInspirationSchema, randomPromptSchema } from "./inspiration.schema";

const prisma = new PrismaClient();

export async function list(_req: Request, res: Response) {
  try {
    const { status, folder, sourceType } = _req.query;
    const items = await service.list(_req.params.projectId, {
      status: status as string | undefined,
      folder: folder as string | undefined,
      sourceType: sourceType as string | undefined,
    });
    res.json({ success: true, data: items });
  } catch (err: any) {
    console.error("[Inspiration] list error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "获取灵感列表失败" } });
  }
}

export async function getById(_req: Request, res: Response) {
  try {
    const item = await service.getById(_req.params.id);
    if (!item) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "灵感条目不存在" } });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function create(_req: Request, res: Response) {
  try {
    const input = createInspirationSchema.parse(_req.body);
    const item = await service.create(_req.params.projectId, input);
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    console.error("[Inspiration] create error:", err);
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "创建灵感失败" } });
  }
}

export async function update(_req: Request, res: Response) {
  try {
    const input = updateInspirationSchema.parse(_req.body);
    const item = await service.update(_req.params.id, input);
    res.json({ success: true, data: item });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function remove(_req: Request, res: Response) {
  try {
    await service.remove(_req.params.id);
    res.json({ success: true, data: null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function promote(_req: Request, res: Response) {
  try {
    const { targetEntityType } = promoteInspirationSchema.parse(_req.body);
    const idea = await service.getById(_req.params.id);
    if (!idea) return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "灵感条目不存在" } });

    // Mark the inspiration as promoted
    await prisma.inspiration.update({
      where: { id: _req.params.id },
      data: {
        status: "ADOPTED",
        promotedEntityType: targetEntityType,
        promotedEntityId: "",
      },
    });

    // Return the idea content so the client can pre-fill the create form
    res.json({
      success: true,
      data: {
        targetEntityType,
        prefill: {
          title: idea.title || "",
          content: idea.content || "",
          tags: idea.tags,
        },
        inspirationId: idea.id,
      },
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: err.errors[0]?.message || "参数错误" } });
    }
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}

export async function randomPrompt(_req: Request, res: Response) {
  try {
    const { category } = randomPromptSchema.parse(_req.query || {});
    const result = service.getRandomPrompt(category);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  }
}
