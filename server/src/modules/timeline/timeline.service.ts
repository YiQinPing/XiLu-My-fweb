import { PrismaClient } from "@prisma/client";
import type { CreateTimelineInput, UpdateTimelineInput, CreateTimelineEventInput, UpdateTimelineEventInput } from "./timeline.schema";

const prisma = new PrismaClient();

async function checkProject(userId: string, projectId: string) {
  const p = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!p) throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
}

function cleanData<T extends Record<string, any>>(input: T): any {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

// --- Timeline CRUD ---
export async function listTimelines(userId: string, projectId: string) {
  await checkProject(userId, projectId);
  return prisma.timeline.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
}

export async function createTimeline(userId: string, input: CreateTimelineInput) {
  await checkProject(userId, input.projectId);
  return prisma.timeline.create({ data: cleanData(input) });
}

export async function updateTimeline(userId: string, id: string, input: UpdateTimelineInput) {
  const tl = await prisma.timeline.findUnique({ where: { id } });
  if (!tl) throw Object.assign(new Error("时间线不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, tl.projectId);
  return prisma.timeline.update({ where: { id }, data: cleanData(input) });
}

export async function removeTimeline(userId: string, id: string) {
  const tl = await prisma.timeline.findUnique({ where: { id } });
  if (!tl) throw Object.assign(new Error("时间线不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, tl.projectId);
  await prisma.timeline.delete({ where: { id } });
}

// --- TimelineEvent CRUD ---
export async function listEvents(userId: string, timelineId: string) {
  const tl = await prisma.timeline.findUnique({ where: { id: timelineId } });
  if (!tl) throw Object.assign(new Error("时间线不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, tl.projectId);
  return prisma.timelineEvent.findMany({
    where: { timelineId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      location: { select: { id: true, name: true } },
      causeEvent: { select: { id: true, title: true } },
    },
  });
}

export async function createEvent(userId: string, input: CreateTimelineEventInput) {
  await checkProject(userId, input.projectId);
  return prisma.timelineEvent.create({ data: { ...cleanData(input), importance: input.importance ?? 3 } });
}

export async function updateEvent(userId: string, id: string, input: UpdateTimelineEventInput) {
  const ev = await prisma.timelineEvent.findUnique({ where: { id } });
  if (!ev) throw Object.assign(new Error("事件不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, ev.projectId);
  return prisma.timelineEvent.update({ where: { id }, data: cleanData(input) });
}

export async function removeEvent(userId: string, id: string) {
  const ev = await prisma.timelineEvent.findUnique({ where: { id } });
  if (!ev) throw Object.assign(new Error("事件不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, ev.projectId);
  await prisma.timelineEvent.delete({ where: { id } });
}
