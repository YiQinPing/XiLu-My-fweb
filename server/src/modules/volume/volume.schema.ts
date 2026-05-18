import { z } from "zod";

export const createVolumeSchema = z.object({
  title: z.string().min(1, "卷名不能为空").max(200),
  subtitle: z.string().max(200).optional(),
  sequenceNum: z.number().int().positive(),
  synopsis: z.string().optional(),
  targetWordCount: z.number().int().positive().optional(),
  status: z.enum(["DRAFTING", "REVISING", "COMPLETED"]).optional(),
});

export const updateVolumeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).optional().nullable(),
  sequenceNum: z.number().int().positive().optional(),
  synopsis: z.string().optional().nullable(),
  targetWordCount: z.number().int().positive().optional().nullable(),
  status: z.enum(["DRAFTING", "REVISING", "COMPLETED"]).optional(),
});

export type CreateVolumeInput = z.infer<typeof createVolumeSchema>;
export type UpdateVolumeInput = z.infer<typeof updateVolumeSchema>;
