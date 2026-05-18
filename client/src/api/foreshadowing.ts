import api from "./client";

export interface ForeshadowingData {
  id: string; projectId: string; title: string;
  description: string | null; type: string; scope: string;
  plantingMethod: string | null;
  plantedChapter: { id: string; title: string } | null;
  revealedChapter: { id: string; title: string } | null;
  status: string; importance: number; targetAwareness: string;
  relatedEvent: { id: string; title: string } | null;
  parentForeshadowing: { id: string; title: string } | null;
  childForeshadowings: { id: string; title: string; status: string }[];
  sortOrder: number;
}

export async function listForeshadowings(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: ForeshadowingData[] }>(`/projects/${projectId}/foreshadowings`);
  return data.data;
}

export async function createForeshadowing(projectId: string, input: {
  title: string; description?: string; type?: string; scope?: string;
  plantingMethod?: string; plantedChapterId?: string;
  status?: string; importance?: number; parentForeshadowingId?: string;
}) {
  const { data } = await api.post(`/projects/${projectId}/foreshadowings`, input);
  return data.data;
}

export async function updateForeshadowing(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/foreshadowings/${id}`, input);
  return data.data;
}

export async function deleteForeshadowing(id: string) {
  await api.delete(`/foreshadowings/${id}`);
}
