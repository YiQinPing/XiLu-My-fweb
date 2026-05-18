import { PrismaClient } from "@prisma/client";
import type { CreateProjectInput, UpdateProjectInput } from "./project.schema";

const prisma = new PrismaClient();

function sanitizeProject(p: any) {
  return p;
}

export async function list(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { volumes: true, characters: true } },
    },
  });

  return projects.map((p) => {
    const { _count, ...rest } = p;
    return { ...rest, volumeCount: _count.volumes, characterCount: _count.characters };
  });
}

export async function create(userId: string, input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: { ...input, userId, genre: input.genre ?? "", description: input.description ?? null },
  });
  return sanitizeProject(project);
}

export async function getById(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      volumes: {
        orderBy: { sequenceNum: "asc" },
        include: {
          chapters: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true, chapterNumber: true, status: true, actualWordCount: true, sortOrder: true } },
        },
      },
      _count: { select: { characters: true, locations: true, factions: true, timelines: true } },
    },
  });

  if (!project) {
    throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }

  const { _count, ...rest } = project;
  return { ...rest, characterCount: _count.characters, locationCount: _count.locations, factionCount: _count.factions, timelineCount: _count.timelines };
}

export async function update(userId: string, projectId: string, input: UpdateProjectInput) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) {
    throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }

  const updated = await prisma.project.update({ where: { id: projectId }, data: input });
  return sanitizeProject(updated);
}

export async function remove(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) {
    throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }

  await prisma.project.delete({ where: { id: projectId } });
}
