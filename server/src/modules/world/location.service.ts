import { PrismaClient } from "@prisma/client";
import type { CreateLocationInput, UpdateLocationInput } from "./location.schema";

const prisma = new PrismaClient();

async function checkProject(userId: string, projectId: string) {
  const p = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!p) throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
}

function buildTree(items: any[]): any[] {
  const map = new Map<string, any>();
  const roots: any[] = [];
  for (const item of items) map.set(item.id, { ...item, children: [] });
  for (const item of items) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) map.get(item.parentId)!.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function list(userId: string, projectId: string) {
  await checkProject(userId, projectId);
  const items = await prisma.location.findMany({ where: { projectId }, orderBy: { sortOrder: "asc" } });
  return buildTree(items);
}

function cleanData<T extends Record<string, any>>(input: T): any {
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

export async function create(userId: string, input: CreateLocationInput) {
  await checkProject(userId, input.projectId);
  return prisma.location.create({ data: { ...cleanData(input), imageUrls: input.imageUrls ?? "[]" } });
}

export async function update(userId: string, locationId: string, input: UpdateLocationInput) {
  const loc = await prisma.location.findUnique({ where: { id: locationId }, include: { project: true } });
  if (!loc || loc.project.userId !== userId) throw Object.assign(new Error("地点不存在"), { statusCode: 404, code: "NOT_FOUND" });
  return prisma.location.update({ where: { id: locationId }, data: cleanData(input) });
}

export async function remove(userId: string, locationId: string) {
  const loc = await prisma.location.findUnique({ where: { id: locationId }, include: { project: true } });
  if (!loc || loc.project.userId !== userId) throw Object.assign(new Error("地点不存在"), { statusCode: 404, code: "NOT_FOUND" });
  await prisma.location.deleteMany({ where: { parentId: locationId } });
  await prisma.location.delete({ where: { id: locationId } });
}
