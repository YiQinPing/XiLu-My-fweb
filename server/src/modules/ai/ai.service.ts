import Anthropic from "@anthropic-ai/sdk";
import type { BrainstormInput, ContinuityCheckInput, StyleAssistInput, SummarizeInput } from "./ai.schema";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-6";  // 当前推荐模型
const MAX_TOKENS = 2048;

function systemPrompt(projectTitle: string) {
  return `你是希陆Flow的AI写作助手，服务于小说作品「${projectTitle}」。你的回答应当：
- 使用中文，除非原文内容为其他语言
- 保持专业、建设性的语气
- 理解小说创作的语境和技巧
- 回答简洁有力，不啰嗦
- 当不确定时，给出多个可能的方向供作者选择`;
}

// --- 头脑风暴 ---
export async function brainstorm(projectTitle: string, input: BrainstormInput): Promise<string> {
  const typeLabels: Record<string, string> = {
    "what-next": "接下来可能发生什么",
    "character-development": "角色发展方向",
    "plot-twist": "情节反转设计",
    "world-building": "世界观扩展",
  };

  const constraintText = input.constraints?.length
    ? `\n约束条件：${input.constraints.join("、")}`
    : "";

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(projectTitle),
    messages: [{
      role: "user",
      content: `【头脑风暴 — ${typeLabels[input.type]}】\n当前情境：${input.context}${constraintText}\n\n请提供3-5个具体的、可操作的创意建议，每个建议包括简要说明和为什么这个方向有趣。`,
    }],
  });

  const block = msg.content[0];
  return block.type === "text" ? block.text : "AI 未能生成有效建议，请重试。";
}

// --- 连续性检查 ---
export async function continuityCheck(projectTitle: string, input: ContinuityCheckInput): Promise<string> {
  const scopeLabels: Record<string, string> = {
    "chapter": "本章",
    "character": "该角色",
    "project": "全书",
  };

  const contentText = input.content ? `\n内容：\n${input.content.slice(0, 8000)}` : "";
  const entityText = input.entityId ? `\n关联实体ID：${input.entityId}` : "";

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(projectTitle),
    messages: [{
      role: "user",
      content: `【连续性检查 — ${scopeLabels[input.scope]}】\n检查以下内容是否存在逻辑矛盾、时间线冲突、人物设定不一致等问题：${contentText}${entityText}\n\n请列出所有发现的不一致项，按严重程度排序。如果没有发现问题，请明确说明。`,
    }],
  });

  const block = msg.content[0];
  return block.type === "text" ? block.text : "AI 未能完成检查，请重试。";
}

// --- 风格润色 ---
export async function styleAssist(projectTitle: string, input: StyleAssistInput): Promise<string> {
  const instructionLabels: Record<string, string> = {
    "show-dont-tell": "将'告诉'改为'展示'——用具体的动作、对话和感官细节来呈现，而非直接陈述情绪或事实",
    "more-concise": "精简冗余表达，去除重复修饰，保持核心信息不变",
    "more-descriptive": "增强画面感，添加适度的感官细节和环境描写",
    "tense-fix": "统一时态，修正前后不一致的时态使用",
  };

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(projectTitle),
    messages: [{
      role: "user",
      content: `【风格润色 — ${instructionLabels[input.instruction]}】\n\n原文：\n${input.content}\n\n请先给出润色后的版本，然后简要说明你做了哪些修改及原因。格式：\n---润色后---\n[内容]\n---修改说明---\n[说明]`,
    }],
  });

  const block = msg.content[0];
  return block.type === "text" ? block.text : "AI 未能完成润色，请重试。";
}

// --- 智能摘要 ---
export async function summarize(projectTitle: string, input: SummarizeInput): Promise<string> {
  const targetLabels: Record<string, string> = {
    "chapter": "章节",
    "character": "人物",
    "location": "地点",
  };

  const styleLabels: Record<string, string> = {
    "brief": "简洁（100-200字）",
    "detailed": "详细（300-500字）",
    "bullet-points": "要点列表",
  };

  const contentText = input.content ? `\n内容：\n${input.content.slice(0, 10000)}` : "";

  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt(projectTitle),
    messages: [{
      role: "user",
      content: `【智能摘要 — ${targetLabels[input.target]}】\n请为以下内容生成${styleLabels[input.style]}的摘要：${contentText}\n\n要求：
- 突出关键情节和转折点
- 保留重要的人物动机和情感变化
- 不遗漏核心信息`,
    }],
  });

  const block = msg.content[0];
  return block.type === "text" ? block.text : "AI 未能生成摘要，请重试。";
}
