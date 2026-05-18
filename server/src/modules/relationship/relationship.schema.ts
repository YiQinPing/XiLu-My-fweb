import { z } from "zod";

export const createRelationshipSchema = z.object({
  projectId: z.string(),
  characterAId: z.string().min(1, "请选择人物A"),
  characterBId: z.string().min(1, "请选择人物B"),
  type: z.string().min(1, "关系类型不能为空").max(100),
  subType: z.string().optional(),
  direction: z.enum(["A_TO_B", "B_TO_A", "MUTUAL"]).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  status: z.enum(["CURRENT", "PAST", "FUTURE", "ALTERNATE"]).optional(),
  startEvent: z.string().optional(),
  endEvent: z.string().optional(),
  howMet: z.string().optional(),
  publicView: z.string().optional(),
  reality: z.string().optional(),
  description: z.string().optional(),
});

export const updateRelationshipSchema = z.object({
  type: z.string().min(1).max(100).optional(),
  subType: z.string().optional().nullable(),
  direction: z.enum(["A_TO_B", "B_TO_A", "MUTUAL"]).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  status: z.enum(["CURRENT", "PAST", "FUTURE", "ALTERNATE"]).optional(),
  startEvent: z.string().optional().nullable(),
  endEvent: z.string().optional().nullable(),
  howMet: z.string().optional().nullable(),
  publicView: z.string().optional().nullable(),
  reality: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
export type UpdateRelationshipInput = z.infer<typeof updateRelationshipSchema>;
