import { z } from "zod";

export const createFactionSchema = z.object({
  projectId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  name: z.string().min(1, "名称不能为空").max(200),
  fullName: z.string().optional(),
  type: z.string().default(""),
  motto: z.string().optional(),
  foundedDate: z.string().optional(),
  isPublic: z.boolean().optional(),
  alignment: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateFactionInput = z.infer<typeof createFactionSchema>;

export const updateFactionSchema = z.object({
  parentId: z.string().optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  fullName: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  motto: z.string().optional().nullable(),
  foundedDate: z.string().optional().nullable(),
  founderId: z.string().optional().nullable(),
  currentLeaderId: z.string().optional().nullable(),
  headquartersId: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
  alignment: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export type UpdateFactionInput = z.infer<typeof updateFactionSchema>;
