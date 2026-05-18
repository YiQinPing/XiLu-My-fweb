import api from "./client";

// --- 地点 ---
export interface LocationNode {
  id: string; projectId: string; parentId: string | null; name: string;
  type: string | null; description: string | null; climate: string | null;
  sortOrder: number; children: LocationNode[];
  createdAt: string; updatedAt: string;
}

export async function listLocations(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: LocationNode[] }>(`/projects/${projectId}/world/locations`);
  return data.data;
}

export async function createLocation(projectId: string, input: { name: string; parentId?: string | null; type?: string; description?: string }) {
  const { data } = await api.post(`/projects/${projectId}/world/locations`, input);
  return data.data;
}

export async function updateLocation(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/locations/${id}`, input);
  return data.data;
}

export async function deleteLocation(id: string) {
  await api.delete(`/locations/${id}`);
}

// --- 势力 ---
export interface FactionItem {
  id: string; projectId: string; parentId: string | null; name: string;
  fullName: string | null; type: string | null; motto: string | null;
  foundedDate: string | null; isPublic: boolean; alignment: string | null;
  description: string | null; sortOrder: number;
  headquarters?: { id: string; name: string } | null;
  members?: { character: { id: string; name: string } }[];
}

export async function listFactions(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: FactionItem[] }>(`/projects/${projectId}/world/factions`);
  return data.data;
}

export async function createFaction(projectId: string, input: { name: string; type?: string; description?: string }) {
  const { data } = await api.post(`/projects/${projectId}/world/factions`, input);
  return data.data;
}

export async function updateFaction(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/factions/${id}`, input);
  return data.data;
}

export async function deleteFaction(id: string) {
  await api.delete(`/factions/${id}`);
}

// --- 物品 ---
export interface ItemData {
  id: string; projectId: string; name: string; type: string | null;
  aliases: string; description: string | null; physicalDesc: string | null;
  properties: string | null; powerLevel: string;
  currentOwner?: { id: string; name: string } | null;
  faction?: { id: string; name: string } | null;
  acquisitionMethod: string | null;
  acquisitionLocation?: { id: string; name: string } | null;
  isKeyItem: boolean; sortOrder: number;
}

export async function listItems(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: ItemData[] }>(`/projects/${projectId}/world/items`);
  return data.data;
}

export async function createItem(projectId: string, input: { name: string; type?: string; description?: string }) {
  const { data } = await api.post(`/projects/${projectId}/world/items`, input);
  return data.data;
}

export async function updateItem(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/items/${id}`, input);
  return data.data;
}

export async function deleteItem(id: string) {
  await api.delete(`/items/${id}`);
}
