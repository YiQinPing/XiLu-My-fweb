import { z } from "zod";

export const brainstormSchema = z.object({
  context: z.string().min(1, "请输入情境描述"),
  type: z.enum(["what-next", "character-development", "plot-twist", "world-building"]).default("what-next"),
  constraints: z.array(z.string()).optional(),
});

export const continuityCheckSchema = z.object({
  scope: z.enum(["chapter", "character", "project"]).default("chapter"),
  entityId: z.string().optional(),
  content: z.string().optional(),
});

export const styleAssistSchema = z.object({
  content: z.string().min(1, "请输入需要润色的文字"),
  instruction: z.enum(["show-dont-tell", "more-concise", "more-descriptive", "tense-fix"]).default("show-dont-tell"),
});

export const summarizeSchema = z.object({
  target: z.enum(["chapter", "character", "location"]),
  entityId: z.string().optional(),
  content: z.string().optional(),
  style: z.enum(["brief", "detailed", "bullet-points"]).default("brief"),
});

export type BrainstormInput = z.infer<typeof brainstormSchema>;
export type ContinuityCheckInput = z.infer<typeof continuityCheckSchema>;
export type StyleAssistInput = z.infer<typeof styleAssistSchema>;
export type SummarizeInput = z.infer<typeof summarizeSchema>;
