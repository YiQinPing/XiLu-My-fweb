import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "作品名称不能为空").max(200),
  subtitle: z.string().max(200).optional(),
  genre: z.string().optional(),
  targetWordCount: z.number().int().positive().optional(),
  language: z.string().optional(),
  writingStage: z.enum(["PLANNING", "DRAFTING", "REVISING", "COMPLETED"]).optional(),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).optional(),
  genre: z.string().optional(),
  targetWordCount: z.number().int().positive().optional().nullable(),
  language: z.string().optional(),
  writingStage: z.enum(["PLANNING", "DRAFTING", "REVISING", "COMPLETED"]).optional(),
  description: z.string().optional().nullable(),
  isArchived: z.boolean().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
