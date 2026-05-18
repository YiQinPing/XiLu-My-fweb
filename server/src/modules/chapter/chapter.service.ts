import { PrismaClient } from "@prisma/client";
import type { CreateChapterInput, UpdateChapterInput } from "./chapter.schema";
import { recalcVolumeWordCount } from "../volume/volume.service";

const prisma = new PrismaClient();

async function checkVolumeOwnership(userId: string, volumeId: string) {
  const volume = await prisma.volume.findUnique({ where: { id: volumeId }, include: { project: true } });
  if (!volume || volume.project.userId !== userId) {
    throw Object.assign(new Error("卷不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
}

export async function list(userId: string, volumeId: string) {
  await checkVolumeOwnership(userId, volumeId);
  return prisma.chapter.findMany({
    where: { volumeId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, chapterNumber: true, chapterType: true, status: true, actualWordCount: true, targetWordCount: true, sortOrder: true, updatedAt: true },
  });
}

export async function create(userId: string, volumeId: string, input: CreateChapterInput) {
  await checkVolumeOwnership(userId, volumeId);
  return prisma.chapter.create({ data: { ...input, volumeId } });
}

export async function getById(userId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { volume: { include: { project: true } } } });
  if (!chapter || chapter.volume.project.userId !== userId) {
    throw Object.assign(new Error("章节不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  return chapter;
}

export async function update(userId: string, chapterId: string, input: UpdateChapterInput) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { volume: { include: { project: true } } } });
  if (!chapter || chapter.volume.project.userId !== userId) {
    throw Object.assign(new Error("章节不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }

  const updated = await prisma.chapter.update({ where: { id: chapterId }, data: input });

  // 如果字数有更新，重新计算卷的总字数
  if (input.actualWordCount !== undefined) {
    await recalcVolumeWordCount(chapter.volumeId);
  }

  return updated;
}

export async function remove(userId: string, chapterId: string) {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, include: { volume: { include: { project: true } } } });
  if (!chapter || chapter.volume.project.userId !== userId) {
    throw Object.assign(new Error("章节不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  await prisma.chapter.delete({ where: { id: chapterId } });
  await recalcVolumeWordCount(chapter.volumeId);
}
