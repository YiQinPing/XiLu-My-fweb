import { z } from "zod";

export const createItemSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "名称不能为空").max(200),
  type: z.string().default(""),
  aliases: z.string().optional(),
  description: z.string().optional(),
  physicalDesc: z.string().optional(),
  properties: z.string().optional(),
  powerLevel: z.enum(["COMMON", "RARE", "LEGENDARY", "ARTIFACT"]).optional(),
  value: z.string().optional(),
  currentOwnerId: z.string().optional().nullable(),
  factionId: z.string().optional().nullable(),
  acquisitionMethod: z.string().optional(),
  acquisitionLocationId: z.string().optional().nullable(),
  usageConditions: z.string().optional(),
  history: z.string().optional(),
  lore: z.string().optional(),
  isKeyItem: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().optional().nullable(),
  aliases: z.string().optional(),
  description: z.string().optional().nullable(),
  physicalDesc: z.string().optional().nullable(),
  properties: z.string().optional().nullable(),
  powerLevel: z.enum(["COMMON", "RARE", "LEGENDARY", "ARTIFACT"]).optional(),
  value: z.string().optional().nullable(),
  currentOwnerId: z.string().optional().nullable(),
  factionId: z.string().optional().nullable(),
  acquisitionMethod: z.string().optional().nullable(),
  acquisitionLocationId: z.string().optional().nullable(),
  usageConditions: z.string().optional().nullable(),
  history: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
  isKeyItem: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;
