import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SearchResult {
  type: "chapter" | "character" | "location" | "faction" | "item" | "outline";
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
}

export async function search(userId: string, projectId: string, q: string): Promise<SearchResult[]> {
  const pattern = `%${q}%`;

  const results: SearchResult[] = [];

  // 章节
  const chapters = await prisma.chapter.findMany({
    where: {
      volume: { projectId, project: { userId } },
      OR: [{ title: { contains: q } }, { content: { contains: q } }],
    },
    select: { id: true, title: true, content: true, volume: { select: { title: true } } },
    take: 10,
  });
  for (const ch of chapters) {
    results.push({
      type: "chapter",
      id: ch.id,
      title: ch.title,
      subtitle: ch.volume.title,
      excerpt: excerpt(ch.content ?? "", q, 80),
    });
  }

  // 人物
  const characters = await prisma.character.findMany({
    where: {
      projectId, project: { userId },
      OR: [
        { name: { contains: q } },
        { appearanceDesc: { contains: q } },
        { childhood: { contains: q } },
        { familyBackground: { contains: q } },
        { personalityType: { contains: q } },
      ],
    },
    select: { id: true, name: true, appearanceDesc: true, roleInStory: true },
    take: 10,
  });
  for (const c of characters) {
    results.push({
      type: "character",
      id: c.id,
      title: c.name,
      subtitle: c.roleInStory ?? undefined,
      excerpt: excerpt(c.appearanceDesc ?? "", q, 80),
    });
  }

  // 地点
  const locations = await prisma.location.findMany({
    where: {
      projectId, project: { userId },
      OR: [{ name: { contains: q } }, { description: { contains: q } }],
    },
    select: { id: true, name: true, type: true, description: true },
    take: 10,
  });
  for (const l of locations) {
    results.push({
      type: "location",
      id: l.id,
      title: l.name,
      subtitle: l.type ?? undefined,
      excerpt: excerpt(l.description ?? "", q, 80),
    });
  }

  // 势力
  const factions = await prisma.faction.findMany({
    where: {
      projectId, project: { userId },
      OR: [{ name: { contains: q } }, { description: { contains: q } }],
    },
    select: { id: true, name: true, type: true, description: true },
    take: 10,
  });
  for (const f of factions) {
    results.push({
      type: "faction",
      id: f.id,
      title: f.name,
      subtitle: f.type ?? undefined,
      excerpt: excerpt(f.description ?? "", q, 80),
    });
  }

  // 物品
  const items = await prisma.item.findMany({
    where: {
      projectId, project: { userId },
      OR: [{ name: { contains: q } }, { description: { contains: q } }],
    },
    select: { id: true, name: true, type: true, description: true },
    take: 10,
  });
  for (const it of items) {
    results.push({
      type: "item",
      id: it.id,
      title: it.name,
      subtitle: it.type ?? undefined,
      excerpt: excerpt(it.description ?? "", q, 80),
    });
  }

  // 大纲
  const outlines = await prisma.outlineBeat.findMany({
    where: {
      projectId, project: { userId },
      OR: [{ title: { contains: q } }, { description: { contains: q } }],
    },
    select: { id: true, title: true, beatType: true, description: true },
    take: 10,
  });
  for (const o of outlines) {
    results.push({
      type: "outline",
      id: o.id,
      title: o.title,
      subtitle: o.beatType ?? undefined,
      excerpt: excerpt(o.description ?? "", q, 80),
    });
  }

  return results;
}

function excerpt(text: string, query: string, maxLen: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const idx = normalized.toLowerCase().indexOf(query.toLowerCase());
  let start = idx >= 0 ? Math.max(0, idx - 20) : 0;
  let end = idx >= 0 ? Math.min(normalized.length, idx + query.length + 60) : Math.min(normalized.length, maxLen);

  if (start > 0 && idx >= 0) {
    const spaceIdx = normalized.lastIndexOf(" ", start);
    if (spaceIdx > 0) start = spaceIdx;
  }
  if (end < normalized.length && idx >= 0) {
    const spaceIdx = normalized.indexOf(" ", end);
    if (spaceIdx > 0) end = spaceIdx;
  }

  let result = normalized.slice(start, end);
  if (start > 0) result = "..." + result;
  if (end < normalized.length) result = result + "...";
  return result;
}
