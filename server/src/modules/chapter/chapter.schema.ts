import { z } from "zod";

export const createChapterSchema = z.object({
  title: z.string().min(1, "章节标题不能为空").max(200),
  chapterNumber: z.string().min(1).max(20),
  chapterType: z.enum(["REGULAR", "PROLOGUE", "EPILOGUE", "INTERLUDE"]).optional(),
  sortOrder: z.number().int(),
  synopsis: z.string().optional(),
  targetWordCount: z.number().int().positive().optional(),
  tags: z.string().optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  chapterNumber: z.string().min(1).max(20).optional(),
  chapterType: z.enum(["REGULAR", "PROLOGUE", "EPILOGUE", "INTERLUDE"]).optional(),
  status: z.enum(["OUTLINE", "DRAFTING", "REVISING", "COMPLETED"]).optional(),
  sortOrder: z.number().int().optional(),
  synopsis: z.string().optional().nullable(),
  targetWordCount: z.number().int().positive().optional().nullable(),
  actualWordCount: z.number().int().optional(),
  content: z.string().optional().nullable(),
  tags: z.string().optional(),
  isLocked: z.boolean().optional(),
  authorNotes: z.string().optional().nullable(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
