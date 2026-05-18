import { PrismaClient } from "@prisma/client";
import type { CreateCharacterInput, UpdateCharacterInput } from "./character.schema";

const prisma = new PrismaClient();

async function checkProjectOwnership(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw Object.assign(new Error("作品不存在"), { statusCode: 404, code: "NOT_FOUND" });
}

export async function list(userId: string, projectId: string) {
  await checkProjectOwnership(userId, projectId);
  return prisma.character.findMany({
    where: { projectId },
    orderBy: [{ importance: "desc" }, { sortOrder: "asc" }],
    select: {
      id: true, projectId: true, name: true, gender: true, apparentAge: true,
      species: true, characterStatus: true, roleInStory: true, tags: true,
      groups: true, importance: true, sortOrder: true, developmentStatus: true,
      avatarUrl: true, occupations: true, createdAt: true, updatedAt: true,
    },
  });
}

export async function create(userId: string, input: CreateCharacterInput) {
  await checkProjectOwnership(userId, input.projectId);
  return prisma.character.create({
    data: {
      ...input,
      aliases: input.aliases ?? "[]",
      occupations: input.occupations ?? "[]",
      coreTraits: input.coreTraits ?? "[]",
      virtues: input.virtues ?? "[]",
      flaws: input.flaws ?? "[]",
      traumas: input.traumas ?? "[]",
      catchphrases: input.catchphrases ?? "[]",
      nervousHabits: input.nervousHabits ?? "[]",
      hobbies: input.hobbies ?? "[]",
      tags: input.tags ?? "[]",
      groups: input.groups ?? "[]",
    },
  });
}

export async function getById(userId: string, characterId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      project: true,
      birthPlace: { select: { id: true, name: true } },
      residence: { select: { id: true, name: true } },
      skills: true,
      goals: true,
      factionMemberships: { include: { faction: { select: { id: true, name: true } } } },
      ownedItems: { select: { id: true, name: true, type: true } },
    },
  });
  if (!character || character.project.userId !== userId) {
    throw Object.assign(new Error("角色不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  return character;
}

export async function update(userId: string, characterId: string, input: UpdateCharacterInput) {
  const character = await prisma.character.findUnique({ where: { id: characterId }, include: { project: true } });
  if (!character || character.project.userId !== userId) {
    throw Object.assign(new Error("角色不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  return prisma.character.update({ where: { id: characterId }, data: input });
}

export async function remove(userId: string, characterId: string) {
  const character = await prisma.character.findUnique({ where: { id: characterId }, include: { project: true } });
  if (!character || character.project.userId !== userId) {
    throw Object.assign(new Error("角色不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  await prisma.character.delete({ where: { id: characterId } });
}
