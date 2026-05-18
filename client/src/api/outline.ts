import api from "./client";

export interface OutlineBeat {
  id: string;
  projectId: string;
  parentId: string | null;
  chapterId: string | null;
  title: string;
  description: string | null;
  beatType: BeatType | null;
  structureName: string | null;
  positionPercent: number | null;
  emotionalIntensity: number | null;
  conflictLevel: number | null;
  status: string | null;
  plotThread: string | null;
  sortOrder: number;
  color: string | null;
  children: OutlineBeat[];
  createdAt: string;
  updatedAt: string;
}

export type BeatType = "ACT" | "SEQUENCE" | "SCENE" | "BEAT";

export interface CreateOutlineBeatInput {
  title: string;
  parentId?: string | null;
  chapterId?: string | null;
  description?: string;
  beatType?: BeatType;
  structureName?: string;
  positionPercent?: number;
  emotionalIntensity?: number;
  conflictLevel?: number;
  plotThread?: string;
  sortOrder: number;
  color?: string;
}

export async function listOutline(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: OutlineBeat[] }>(`/projects/${projectId}/outline`);
  return data.data;
}

export async function createOutlineBeat(projectId: string, input: CreateOutlineBeatInput) {
  const { data } = await api.post<{ success: boolean; data: OutlineBeat }>(`/projects/${projectId}/outline`, input);
  return data.data;
}

export async function updateOutlineBeat(id: string, input: Partial<OutlineBeat>) {
  const { data } = await api.patch<{ success: boolean; data: OutlineBeat }>(`/outline/${id}`, input);
  return data.data;
}

export async function deleteOutlineBeat(id: string) {
  await api.delete(`/outline/${id}`);
}

// 故事结构模板
export interface StructureTemplate {
  name: string;
  label: string;
  description: string;
  beats: { title: string; beatType: BeatType; positionPercent?: number; description?: string; children?: { title: string; beatType: BeatType; description?: string }[] }[];
}

export const structureTemplates: StructureTemplate[] = [
  {
    name: "three-act",
    label: "三幕式",
    description: "经典好莱坞三幕结构：建置 → 对抗 → 解决",
    beats: [
      { title: "第一幕：建置", beatType: "ACT", positionPercent: 0,
        children: [
          { title: "开场", beatType: "SEQUENCE", description: "展示日常世界和主角的状态" },
          { title: "激励事件", beatType: "BEAT", description: "打破平衡的关键事件" },
          { title: "第一幕转折点", beatType: "BEAT", description: "主角做出不可逆的选择，进入新世界" },
        ],
      },
      { title: "第二幕：对抗", beatType: "ACT", positionPercent: 25,
        children: [
          { title: "上升行动", beatType: "SEQUENCE", description: "一系列挑战和障碍不断升级" },
          { title: "中点", beatType: "BEAT", description: "重大转折或揭示，赌注提高" },
          { title: "最黑暗时刻", beatType: "BEAT", description: "看似失败，一切希望都破灭" },
          { title: "第二幕转折点", beatType: "BEAT", description: "获得新的领悟或力量，决心再起" },
        ],
      },
      { title: "第三幕：解决", beatType: "ACT", positionPercent: 75,
        children: [
          { title: "高潮", beatType: "SEQUENCE", description: "最终对决，解决核心冲突" },
          { title: "结局", beatType: "BEAT", description: "展现变化后的新平衡" },
        ],
      },
    ],
  },
  {
    name: "hero-journey",
    label: "英雄之旅",
    description: "Joseph Campbell 12阶段神话结构",
    beats: [
      { title: "普通世界", beatType: "ACT", positionPercent: 0,
        children: [
          { title: "1. 平凡世界", beatType: "BEAT", description: "英雄在平凡的环境中被介绍" },
          { title: "2. 冒险召唤", beatType: "BEAT", description: "英雄面临一个问题或挑战" },
          { title: "3. 拒绝召唤", beatType: "BEAT", description: "英雄最初犹豫或拒绝冒险" },
          { title: "4. 遇见导师", beatType: "BEAT", description: "导师给予建议、训练或宝物" },
          { title: "5. 跨过第一道门槛", beatType: "BEAT", description: "英雄彻底投入冒险" },
        ],
      },
      { title: "特殊世界", beatType: "ACT", positionPercent: 40,
        children: [
          { title: "6. 考验、盟友与敌人", beatType: "SEQUENCE", description: "面对一系列挑战，建立关系" },
          { title: "7. 接近深穴", beatType: "BEAT", description: "接近最大危险，准备核心考验" },
          { title: "8. 核心考验", beatType: "BEAT", description: "面对最大的恐惧或敌人，经历'死亡与重生'" },
          { title: "9. 获得报酬", beatType: "BEAT", description: "取得宝物、知识或力量" },
        ],
      },
      { title: "返回", beatType: "ACT", positionPercent: 70,
        children: [
          { title: "10. 回归之路", beatType: "SEQUENCE", description: "带着奖赏返回，但仍面临危险" },
          { title: "11. 复活", beatType: "BEAT", description: "最后一次净化考验，运用所学" },
          { title: "12. 带着灵药返回", beatType: "BEAT", description: "带着改变自己和世界的力量归来" },
        ],
      },
    ],
  },
];

export async function applyTemplate(projectId: string, templateName: string) {
  const template = structureTemplates.find((t) => t.name === templateName);
  if (!template) throw new Error("模板不存在");

  const created: OutlineBeat[] = [];
  let order = 0;

  async function createBeats(beats: StructureTemplate["beats"], parentId?: string) {
    for (const beat of beats) {
      const b = await createOutlineBeat(projectId, {
        title: beat.title,
        beatType: beat.beatType,
        parentId: parentId ?? null,
        positionPercent: beat.positionPercent,
        description: beat.description,
        sortOrder: order++,
      });
      created.push(b);
      if (beat.children) {
        await createBeats(beat.children, b.id);
      }
    }
  }

  await createBeats(template.beats);
  return created;
}
