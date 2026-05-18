import { z } from "zod";

export const createOutlineBeatSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  parentId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  description: z.string().optional(),
  beatType: z.enum(["ACT", "SEQUENCE", "SCENE", "BEAT"]).optional(),
  structureName: z.string().optional(),
  positionPercent: z.number().int().min(0).max(100).optional(),
  emotionalIntensity: z.number().int().min(1).max(10).optional(),
  conflictLevel: z.number().int().min(1).max(10).optional(),
  status: z.enum(["PLANNED", "WRITING", "COMPLETED"]).optional(),
  plotThread: z.string().optional(),
  sortOrder: z.number().int(),
  color: z.string().optional(),
});

export const updateOutlineBeatSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  parentId: z.string().optional().nullable(),
  chapterId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  beatType: z.enum(["ACT", "SEQUENCE", "SCENE", "BEAT"]).optional(),
  structureName: z.string().optional().nullable(),
  positionPercent: z.number().int().min(0).max(100).optional().nullable(),
  emotionalIntensity: z.number().int().min(1).max(10).optional().nullable(),
  conflictLevel: z.number().int().min(1).max(10).optional().nullable(),
  status: z.enum(["PLANNED", "WRITING", "COMPLETED"]).optional(),
  plotThread: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  color: z.string().optional().nullable(),
});

export type CreateOutlineBeatInput = z.infer<typeof createOutlineBeatSchema>;
export type UpdateOutlineBeatInput = z.infer<typeof updateOutlineBeatSchema>;

export interface OutlineBeatResponse {
  id: string;
  projectId: string;
  parentId: string | null;
  chapterId: string | null;
  title: string;
  description: string | null;
  beatType: string | null;
  structureName: string | null;
  positionPercent: number | null;
  emotionalIntensity: number | null;
  conflictLevel: number | null;
  status: string | null;
  plotThread: string | null;
  sortOrder: number;
  color: string | null;
  children: OutlineBeatResponse[];
  createdAt: string;
  updatedAt: string;
}
