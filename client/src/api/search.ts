import api from "./client";

export interface SearchResult {
  type: "chapter" | "character" | "location" | "faction" | "item" | "outline";
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
}

export async function search(projectId: string, q: string) {
  const { data } = await api.get<{ success: boolean; data: SearchResult[] }>("/search", {
    params: { projectId, q },
  });
  return data.data;
}
