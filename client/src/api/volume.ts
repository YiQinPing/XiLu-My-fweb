import api from "./client";

export interface Volume {
  id: string;
  projectId: string;
  title: string;
  subtitle: string | null;
  sequenceNum: number;
  status: string;
  synopsis: string | null;
  actualWordCount: number;
  targetWordCount: number | null;
  chapters?: ChapterBrief[];
}

export interface ChapterBrief {
  id: string;
  title: string;
  chapterNumber: string;
  status: string;
  actualWordCount: number;
  sortOrder: number;
}

export async function listVolumes(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: Volume[] }>(`/projects/${projectId}/volumes`);
  return data.data;
}

export async function createVolume(projectId: string, input: { title: string; sequenceNum: number; subtitle?: string; synopsis?: string }) {
  const { data } = await api.post<{ success: boolean; data: Volume }>(`/projects/${projectId}/volumes`, input);
  return data.data;
}

export async function updateVolume(id: string, input: Partial<Volume>) {
  const { data } = await api.patch<{ success: boolean; data: Volume }>(`/volumes/${id}`, input);
  return data.data;
}

export async function deleteVolume(id: string) {
  await api.delete(`/volumes/${id}`);
}
