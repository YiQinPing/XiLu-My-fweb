import { z } from "zod";

// --- Timeline ---
export const createTimelineSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1, "名称不能为空").max(200),
  description: z.string().optional(),
  narrativeFunction: z.string().optional(),
  relationship: z.string().optional(),
});

export const updateTimelineSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  narrativeFunction: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
});

export type CreateTimelineInput = z.infer<typeof createTimelineSchema>;
export type UpdateTimelineInput = z.infer<typeof updateTimelineSchema>;

// --- TimelineEvent ---
export const createTimelineEventSchema = z.object({
  projectId: z.string(),
  timelineId: z.string().min(1),
  title: z.string().min(1, "标题不能为空").max(200),
  description: z.string().optional(),
  date: z.string().optional(),
  approximateDate: z.string().optional(),
  relativeDate: z.string().optional(),
  duration: z.string().optional(),
  eventType: z.string().default("GENERAL"),
  importance: z.number().int().min(1).max(10).optional(),
  status: z.enum(["PLANNED", "HAPPENED", "ONGOING"]).optional(),
  locationId: z.string().optional().nullable(),
  causeEventId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const updateTimelineEventSchema = z.object({
  timelineId: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  approximateDate: z.string().optional().nullable(),
  relativeDate: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  eventType: z.string().optional(),
  importance: z.number().int().min(1).max(10).optional(),
  status: z.enum(["PLANNED", "HAPPENED", "ONGOING"]).optional(),
  locationId: z.string().optional().nullable(),
  causeEventId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export type CreateTimelineEventInput = z.infer<typeof createTimelineEventSchema>;
export type UpdateTimelineEventInput = z.infer<typeof updateTimelineEventSchema>;
