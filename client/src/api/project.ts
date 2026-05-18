import api from "./client";

export interface Project {
  id: string;
  title: string;
  subtitle: string | null;
  genre: string;
  targetWordCount: number | null;
  language: string;
  writingStage: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  volumeCount?: number;
  characterCount?: number;
}

export interface ProjectDetail extends Project {
  volumes: VolumeWithChapters[];
  locationCount: number;
  factionCount: number;
  timelineCount: number;
}

export interface VolumeWithChapters {
  id: string;
  title: string;
  subtitle: string | null;
  sequenceNum: number;
  status: string;
  actualWordCount: number;
  chapters: ChapterBrief[];
}

export interface ChapterBrief {
  id: string;
  title: string;
  chapterNumber: string;
  status: string;
  actualWordCount: number;
  sortOrder: number;
}

export async function listProjects() {
  const { data } = await api.get<{ success: boolean; data: Project[] }>("/projects");
  return data.data;
}

export async function createProject(input: { title: string; subtitle?: string; genre?: string; targetWordCount?: number; description?: string }) {
  const { data } = await api.post<{ success: boolean; data: Project }>("/projects", input);
  return data.data;
}

export async function getProject(id: string) {
  const { data } = await api.get<{ success: boolean; data: ProjectDetail }>(`/projects/${id}`);
  return data.data;
}

export async function updateProject(id: string, input: Partial<Project>) {
  const { data } = await api.patch<{ success: boolean; data: Project }>(`/projects/${id}`, input);
  return data.data;
}

export async function deleteProject(id: string) {
  await api.delete(`/projects/${id}`);
}
