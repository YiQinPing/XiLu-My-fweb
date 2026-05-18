import { PrismaClient } from "@prisma/client";
import type { CreateItemInput, UpdateItemInput } from "./item.schema";

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
  return prisma.item.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
    include: {
      currentOwner: { select: { id: true, name: true } },
      faction: { select: { id: true, name: true } },
      acquisitionLocation: { select: { id: true, name: true } },
    },
  });
}

export async function create(userId: string, input: CreateItemInput) {
  await checkProject(userId, input.projectId);
  return prisma.item.create({ data: { ...cleanData(input), aliases: input.aliases ?? "[]" } });
}

export async function update(userId: string, itemId: string, input: UpdateItemInput) {
  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { project: true } });
  if (!item || item.project.userId !== userId) throw Object.assign(new Error("物品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  return prisma.item.update({ where: { id: itemId }, data: cleanData(input) });
}

export async function remove(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({ where: { id: itemId }, include: { project: true } });
  if (!item || item.project.userId !== userId) throw Object.assign(new Error("物品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await prisma.item.delete({ where: { id: itemId } });
}
