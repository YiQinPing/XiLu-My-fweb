import { PrismaClient } from "@prisma/client";
import type { CreateFactionInput, UpdateFactionInput } from "./faction.schema";

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
  return prisma.faction.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
    include: {
      members: { include: { character: { select: { id: true, name: true } } } },
      headquarters: { select: { id: true, name: true } },
    },
  });
}

export async function create(userId: string, input: CreateFactionInput) {
  await checkProject(userId, input.projectId);
  return prisma.faction.create({ data: cleanData(input) });
}

export async function update(userId: string, factionId: string, input: UpdateFactionInput) {
  const f = await prisma.faction.findUnique({ where: { id: factionId }, include: { project: true } });
  if (!f || f.project.userId !== userId) throw Object.assign(new Error("势力不存在"), { statusCode: 404, code: "NOT_FOUND" });
  return prisma.faction.update({ where: { id: factionId }, data: cleanData(input) });
}

export async function remove(userId: string, factionId: string) {
  const f = await prisma.faction.findUnique({ where: { id: factionId }, include: { project: true } });
  if (!f || f.project.userId !== userId) throw Object.assign(new Error("势力不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await prisma.faction.delete({ where: { id: factionId } });
}
