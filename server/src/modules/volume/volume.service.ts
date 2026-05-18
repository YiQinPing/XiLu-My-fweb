import { PrismaClient } from "@prisma/client";
import type { CreateVolumeInput, UpdateVolumeInput } from "./volume.schema";

const prisma = new PrismaClient();

async function checkProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) {
    throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
}

async function recalcVolumeWordCount(volumeId: string) {
  const chapters = await prisma.chapter.findMany({ where: { volumeId } });
  const total = chapters.reduce((sum, ch) => sum + ch.actualWordCount, 0);
  await prisma.volume.update({ where: { id: volumeId }, data: { actualWordCount: total } });
}

export async function list(userId: string, projectId: string) {
  await checkProjectOwnership(userId, projectId);
  return prisma.volume.findMany({
    where: { projectId },
    orderBy: { sequenceNum: "asc" },
    include: {
      chapters: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, chapterNumber: true, status: true, actualWordCount: true, sortOrder: true } },
    },
  });
}

export async function create(userId: string, projectId: string, input: CreateVolumeInput) {
  await checkProjectOwnership(userId, projectId);
  return prisma.volume.create({ data: { ...input, projectId } });
}

export async function update(userId: string, volumeId: string, input: UpdateVolumeInput) {
  const volume = await prisma.volume.findUnique({ where: { id: volumeId }, include: { project: true } });
  if (!volume || volume.project.userId !== userId) {
    throw Object.assign(new Error("卷不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  return prisma.volume.update({ where: { id: volumeId }, data: input });
}

export async function remove(userId: string, volumeId: string) {
  const volume = await prisma.volume.findUnique({ where: { id: volumeId }, include: { project: true } });
  if (!volume || volume.project.userId !== userId) {
    throw Object.assign(new Error("卷不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  await prisma.volume.delete({ where: { id: volumeId } });
}

export { recalcVolumeWordCount };
