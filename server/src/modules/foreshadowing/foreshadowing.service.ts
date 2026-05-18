import { PrismaClient } from "@prisma/client";
import type { CreateForeshadowingInput, UpdateForeshadowingInput } from "./foreshadowing.schema";

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

export async function list(userId: string, projectId: string) {
  await checkProject(userId, projectId);
  return prisma.foreshadowing.findMany({
    where: { projectId },
    orderBy: [{ importance: "desc" }, { sortOrder: "asc" }],
    include: {
      plantedChapter: { select: { id: true, title: true } },
      revealedChapter: { select: { id: true, title: true } },
      relatedEvent: { select: { id: true, title: true } },
      parentForeshadowing: { select: { id: true, title: true } },
      childForeshadowings: { select: { id: true, title: true, status: true } },
    },
  });
}

export async function create(userId: string, input: CreateForeshadowingInput) {
  await checkProject(userId, input.projectId);
  return prisma.foreshadowing.create({ data: { ...cleanData(input), importance: input.importance ?? 3 } });
}

export async function update(userId: string, id: string, input: UpdateForeshadowingInput) {
  const fs = await prisma.foreshadowing.findUnique({ where: { id } });
  if (!fs) throw Object.assign(new Error("伏笔不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, fs.projectId);
  return prisma.foreshadowing.update({ where: { id }, data: cleanData(input) });
}

export async function remove(userId: string, id: string) {
  const fs = await prisma.foreshadowing.findUnique({ where: { id } });
  if (!fs) throw Object.assign(new Error("伏笔不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, fs.projectId);
  // Unlink children from deleted parent
  await prisma.foreshadowing.updateMany({ where: { parentForeshadowingId: id }, data: { parentForeshadowingId: null } });
  await prisma.foreshadowing.delete({ where: { id } });
}
