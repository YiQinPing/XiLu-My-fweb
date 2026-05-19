import { z } from "zod";

const SOURCE_TYPES = ["DREAM", "READING", "CONVERSATION", "OBSERVATION", "SHOWER", "IMAGE", "MUSIC", "RESEARCH", "WRITING_EXERCISE", "RANDOM", "OTHER"] as const;
const STATUSES = ["RAW", "DEVELOPING", "READY", "ADOPTED", "ARCHIVED"] as const;

export const createInspirationSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "内容不能为空"),
  sourceType: z.enum(SOURCE_TYPES).default("OTHER"),
  sourceDetail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(STATUSES).default("RAW"),
  priority: z.number().int().min(1).max(5).default(3),
  folder: z.string().optional(),
});

export const updateInspirationSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  sourceType: z.enum(SOURCE_TYPES).optional(),
  sourceDetail: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(STATUSES).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  folder: z.string().optional(),
});

export const promoteInspirationSchema = z.object({
  targetEntityType: z.enum(["chapter", "character", "outline", "location", "timeline_event", "foreshadowing"]),
});

export const randomPromptSchema = z.object({
  category: z.enum(["writing-prompt", "what-if", "constraint"]).optional(),
});

export type CreateInspirationInput = z.infer<typeof createInspirationSchema>;
export type UpdateInspirationInput = z.infer<typeof updateInspirationSchema>;
export type PromoteInspirationInput = z.infer<typeof promoteInspirationSchema>;
