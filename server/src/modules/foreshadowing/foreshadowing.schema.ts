import { z } from "zod";

export const createForeshadowingSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, "标题不能为空").max(200),
  description: z.string().optional(),
  type: z.string().default("DETAIL"),
  scope: z.enum(["LINE_LEVEL", "CHAPTER_LEVEL", "ARC_LEVEL", "BOOK_LEVEL", "SERIES_LEVEL"]).optional(),
  plantingMethod: z.string().optional(),
  plantedChapterId: z.string().optional().nullable(),
  revealedChapterId: z.string().optional().nullable(),
  status: z.enum(["PLANTED", "DEVELOPING", "REVEALED", "ABANDONED"]).optional(),
  importance: z.number().int().min(1).max(10).optional(),
  targetAwareness: z.enum(["SHARP_READERS", "REREADERS", "ALL_READERS"]).optional(),
  relatedEventId: z.string().optional().nullable(),
  parentForeshadowingId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const updateForeshadowingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  type: z.string().optional(),
  scope: z.enum(["LINE_LEVEL", "CHAPTER_LEVEL", "ARC_LEVEL", "BOOK_LEVEL", "SERIES_LEVEL"]).optional(),
  plantingMethod: z.string().optional().nullable(),
  plantedChapterId: z.string().optional().nullable(),
  revealedChapterId: z.string().optional().nullable(),
  status: z.enum(["PLANTED", "DEVELOPING", "REVEALED", "ABANDONED"]).optional(),
  importance: z.number().int().min(1).max(10).optional(),
  targetAwareness: z.enum(["SHARP_READERS", "REREADERS", "ALL_READERS"]).optional(),
  relatedEventId: z.string().optional().nullable(),
  parentForeshadowingId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export type CreateForeshadowingInput = z.infer<typeof createForeshadowingSchema>;
export type UpdateForeshadowingInput = z.infer<typeof updateForeshadowingSchema>;
