import { z } from "zod";

export const createLocationSchema = z.object({
  projectId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  name: z.string().min(1, "名称不能为空").max(200),
  type: z.string().default(""),
  description: z.string().optional().nullable(),
  climate: z.string().optional(),
  imageUrls: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateLocationSchema = z.object({
  parentId: z.string().optional().nullable(),
  name: z.string().min(1).max(200).optional(),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  climate: z.string().optional().nullable(),
  controllingFactionId: z.string().optional().nullable(),
  imageUrls: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
