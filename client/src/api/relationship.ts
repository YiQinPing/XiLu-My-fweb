import api from "./client";

export interface RelationCharacter {
  id: string;
  name: string;
  avatarUrl: string | null;
  roleInStory: string | null;
}

export interface RelationData {
  id: string;
  projectId: string;
  characterAId: string;
  characterA: RelationCharacter;
  characterBId: string;
  characterB: RelationCharacter;
  type: string;
  subType: string | null;
  direction: string;
  intensity: number;
  status: string;
  startEvent: string | null;
  endEvent: string | null;
  howMet: string | null;
  publicView: string | null;
  reality: string | null;
  description: string | null;
}

export async function listRelationships(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: RelationData[] }>(`/projects/${projectId}/relationships`);
  return data.data;
}

export async function createRelationship(projectId: string, input: {
  characterAId: string;
  characterBId: string;
  type: string;
  subType?: string;
  direction?: string;
  intensity?: number;
  status?: string;
  description?: string;
}) {
  const { data } = await api.post(`/projects/${projectId}/relationships`, input);
  return data.data;
}

export async function updateRelationship(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/relationships/${id}`, input);
  return data.data;
}

export async function deleteRelationship(id: string) {
  await api.delete(`/relationships/${id}`);
}
