import api from "./client";

export interface InspirationData {
  id: string;
  projectId: string;
  title: string;
  content: string;
  sourceType: string;
  sourceDetail: string;
  tags: string;
  status: string;
  priority: number;
  relatedModule?: string;
  folder: string;
  promotedEntityType?: string;
  promotedEntityId?: string;
  attachmentUrls: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInspirationInput {
  title?: string;
  content: string;
  sourceType?: string;
  sourceDetail?: string;
  tags?: string[];
  status?: string;
  priority?: number;
  folder?: string;
}

export interface UpdateInspirationInput {
  title?: string;
  content?: string;
  sourceType?: string;
  sourceDetail?: string;
  tags?: string[];
  status?: string;
  priority?: number;
  folder?: string;
}

export async function listInspirations(projectId: string, filters?: { status?: string; folder?: string; sourceType?: string }) {
  const { data } = await api.get<{ success: boolean; data: InspirationData[] }>(`/projects/${projectId}/inspirations`, { params: filters });
  return data.data;
}

export async function getInspiration(projectId: string, id: string) {
  const { data } = await api.get<{ success: boolean; data: InspirationData }>(`/projects/${projectId}/inspirations/${id}`);
  return data.data;
}

export async function createInspiration(projectId: string, input: CreateInspirationInput) {
  const { data } = await api.post<{ success: boolean; data: InspirationData }>(`/projects/${projectId}/inspirations`, input);
  return data.data;
}

export async function updateInspiration(projectId: string, id: string, input: UpdateInspirationInput) {
  const { data } = await api.patch<{ success: boolean; data: InspirationData }>(`/projects/${projectId}/inspirations/${id}`, input);
  return data.data;
}

export async function deleteInspiration(projectId: string, id: string) {
  await api.delete(`/projects/${projectId}/inspirations/${id}`);
}

export async function promoteInspiration(projectId: string, id: string, targetEntityType: string) {
  const { data } = await api.post<{ success: boolean; data: { targetEntityType: string; prefill: { title: string; content: string; tags: string }; inspirationId: string } }>(`/projects/${projectId}/inspirations/${id}/promote`, { targetEntityType });
  return data.data;
}

export async function getRandomPrompt(projectId: string, category?: string) {
  const { data } = await api.get<{ success: boolean; data: { prompt: string; category: string } }>(`/projects/${projectId}/inspirations/random-prompt`, { params: { category } });
  return data.data;
}
