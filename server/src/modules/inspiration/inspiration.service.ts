import { PrismaClient } from "@prisma/client";
import type { CreateInspirationInput, UpdateInspirationInput } from "./inspiration.schema";

const prisma = new PrismaClient();

function cleanData<T extends Record<string, unknown>>(input: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) result[k] = v;
  }
  return result;
}

export async function list(projectId: string, filters?: { status?: string; folder?: string; sourceType?: string }) {
  const where: Record<string, unknown> = { projectId };
  if (filters?.status) where.status = filters.status;
  if (filters?.folder) where.folder = filters.folder;
  if (filters?.sourceType) where.sourceType = filters.sourceType;

  return prisma.inspiration.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getById(id: string) {
  return prisma.inspiration.findUnique({ where: { id } });
}

export async function create(projectId: string, input: CreateInspirationInput) {
  return prisma.inspiration.create({
    data: {
      projectId,
      title: input.title || "",
      content: input.content,
      sourceType: input.sourceType,
      sourceDetail: input.sourceDetail || "",
      tags: JSON.stringify(input.tags || []),
      status: input.status,
      priority: input.priority,
      folder: input.folder || "",
    },
  });
}

export async function update(id: string, input: UpdateInspirationInput) {
  const data = cleanData(input);
  if (data.tags) data.tags = JSON.stringify(data.tags);
  return prisma.inspiration.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.inspiration.delete({ where: { id } });
}

const RANDOM_PROMPTS = {
  "writing-prompt": [
    "深夜，一个陌生人在雨中敲响了你的车窗……",
    "她在旧书店里发现了一本日记，日记的最后一页写着她自己的名字。",
    "当所有人都对你说谎时，你唯一能相信的人是谁？",
    "一颗流星坠落在小镇广场上，里面是一段来自未来的讯息。",
    "他是一位退休的杀手，直到某天收到了一份无法拒绝的委托——他的前妻。",
    "王国的魔法源泉正在枯竭，而最后一个魔法师竟然是……一个不会说话的孩子。",
    "你获得了一种能力：每当你说谎，说谎的对象就会短暂消失。",
    "在一个禁止音乐的世界里，少年在废墟中找到了最后一把吉他。",
    "她死后第七天，男主收到了她发来的微信消息。",
    "人工智能计算出人类将在30年内灭绝，但幸存者名单上没有你的名字。",
  ],
  "what-if": [
    "如果时间不是线性的，而是像空间一样可以四处移动？",
    "如果每个人出生时都带着一个数字——这个数字代表你将改变多少人的人生？",
    "如果梦境是平行宇宙的另一个你经历过的事情？",
    "如果世界上只有一个人能说谎？",
    "如果动物的寿命是人类的十倍会怎样？",
    "如果每次你做出重大选择，都会在另一个平行宇宙产生一个「反选择」的你？",
    "如果语言不仅是交流工具，还是一种能改变现实的咒语？",
    "如果地球上最后一个人类是一个从未离开过实验室的克隆人？",
  ],
  "constraint": [
    "用不超过500字写一个完整的故事，必须以「砰」开头，以「安静」结尾。",
    "写一段对话，但两个角色永远不能正面回答对方的问题。",
    "描述一个房间（至少100字），但禁止使用任何颜色词。",
    "写一个战斗场景，但主角只能在防御，不能主动出击。",
    "用第一人称写一段文字，但叙述者其实已经死了，只是不自知。",
    "写一段关于「离别」的文字，但不准出现「哭」「泪」「伤」「痛」「走」五字。",
    "用三种不同的视角（第一人称/第二人称/第三人称）描述同一事件，每种不超过200字。",
  ],
};

export function getRandomPrompt(category?: string) {
  const key = category && RANDOM_PROMPTS[category as keyof typeof RANDOM_PROMPTS] ? category : "writing-prompt";
  const prompts = RANDOM_PROMPTS[key as keyof typeof RANDOM_PROMPTS];
  const prompt = prompts[Math.floor(Math.random() * prompts.length)];
  return { prompt, category: key };
}
