import { PrismaClient } from "@prisma/client";
import type { CreateOutlineBeatInput, UpdateOutlineBeatInput } from "./outline.schema";

const prisma = new PrismaClient();

async function checkProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) {
    throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
}

function buildTree(
  beats: Array<{
    id: string; projectId: string; parentId: string | null; chapterId: string | null;
    title: string; description: string | null; beatType: string | null;
    structureName: string | null; positionPercent: number | null;
    emotionalIntensity: number | null; conflictLevel: number | null; status: string | null;
    plotThread: string | null; sortOrder: number; color: string | null;
    createdAt: Date; updatedAt: Date;
  }>,
): any[] {
  const map = new Map<string, any>();
  const roots: any[] = [];

  for (const beat of beats) {
    map.set(beat.id, { ...beat, children: [] });
  }

  for (const beat of beats) {
    const node = map.get(beat.id)!;
    if (beat.parentId && map.has(beat.parentId)) {
      map.get(beat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function list(userId: string, projectId: string) {
  await checkProjectOwnership(userId, projectId);
  const beats = await prisma.outlineBeat.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  });
  return buildTree(beats);
}

export async function create(userId: string, projectId: string, input: CreateOutlineBeatInput) {
  await checkProjectOwnership(userId, projectId);
  return prisma.outlineBeat.create({ data: { ...input, projectId } });
}

export async function update(userId: string, beatId: string, input: UpdateOutlineBeatInput) {
  const beat = await prisma.outlineBeat.findUnique({ where: { id: beatId }, include: { project: true } });
  if (!beat || beat.project.userId !== userId) {
    throw Object.assign(new Error("节拍不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  return prisma.outlineBeat.update({ where: { id: beatId }, data: input });
}

export async function remove(userId: string, beatId: string) {
  const beat = await prisma.outlineBeat.findUnique({ where: { id: beatId }, include: { project: true } });
  if (!beat || beat.project.userId !== userId) {
    throw Object.assign(new Error("节拍不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  // 同时删除子节点
  await prisma.outlineBeat.deleteMany({ where: { parentId: beatId } });
  await prisma.outlineBeat.delete({ where: { id: beatId } });
}
