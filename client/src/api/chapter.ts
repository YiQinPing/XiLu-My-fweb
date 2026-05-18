import api from "./client";

export interface ChapterListItem {
  id: string;
  title: string;
  chapterNumber: string;
  chapterType: string;
  status: string;
  actualWordCount: number;
  targetWordCount: number | null;
  sortOrder: number;
  updatedAt: string;
}

export interface ChapterDetail {
  id: string;
  volumeId: string;
  title: string;
  chapterNumber: string;
  chapterType: string;
  status: string;
  actualWordCount: number;
  targetWordCount: number | null;
  sortOrder: number;
  synopsis: string | null;
  content: string | null;
  tags: string;
  isLocked: boolean;
  authorNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listChapters(volumeId: string) {
  const { data } = await api.get<{ success: boolean; data: ChapterListItem[] }>(`/volumes/${volumeId}/chapters`);
  return data.data;
}

export async function createChapter(volumeId: string, input: { title: string; chapterNumber: string; sortOrder: number; synopsis?: string }) {
  const { data } = await api.post<{ success: boolean; data: ChapterListItem }>(`/volumes/${volumeId}/chapters`, input);
  return data.data;
}

export async function getChapter(id: string) {
  const { data } = await api.get<{ success: boolean; data: ChapterDetail }>(`/chapters/${id}`);
  return data.data;
}

export async function updateChapter(id: string, input: Partial<ChapterDetail>) {
  const { data } = await api.patch<{ success: boolean; data: ChapterDetail }>(`/chapters/${id}`, input);
  return data.data;
}

export async function deleteChapter(id: string) {
  await api.delete(`/chapters/${id}`);
}
