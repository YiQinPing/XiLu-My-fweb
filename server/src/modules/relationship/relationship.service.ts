import { PrismaClient } from "@prisma/client";
import type { CreateRelationshipInput, UpdateRelationshipInput } from "./relationship.schema";

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
  return prisma.characterRelationship.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: {
      characterA: { select: { id: true, name: true, avatarUrl: true, roleInStory: true } },
      characterB: { select: { id: true, name: true, avatarUrl: true, roleInStory: true } },
    },
  });
}

export async function create(userId: string, input: CreateRelationshipInput) {
  await checkProject(userId, input.projectId);
  if (input.characterAId === input.characterBId) {
    throw Object.assign(new Error("不能与自身创建关系"), { statusCode: 400, code: "SELF_RELATION" });
  }
  const existing = await prisma.characterRelationship.findFirst({
    where: {
      projectId: input.projectId,
      characterAId: input.characterAId,
      characterBId: input.characterBId,
      type: input.type,
    },
  });
  if (existing) throw Object.assign(new Error("相同类型的关系已存在"), { statusCode: 409, code: "DUPLICATE" });
  return prisma.characterRelationship.create({ data: { ...cleanData(input), intensity: input.intensity ?? 5 } });
}

async function checkOwnership(userId: string, id: string) {
  const rel = await prisma.characterRelationship.findUnique({ where: { id } });
  if (!rel) throw Object.assign(new Error("关系不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await checkProject(userId, rel.projectId);
  return rel;
}

export async function update(userId: string, id: string, input: UpdateRelationshipInput) {
  await checkOwnership(userId, id);
  return prisma.characterRelationship.update({ where: { id }, data: cleanData(input) });
}

export async function remove(userId: string, id: string) {
  await checkOwnership(userId, id);
  await prisma.characterRelationship.delete({ where: { id } });
}
