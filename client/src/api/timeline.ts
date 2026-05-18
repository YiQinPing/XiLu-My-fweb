import api from "./client";

// --- Timeline ---
export interface TimelineData {
  id: string; projectId: string; name: string;
  description: string | null; narrativeFunction: string | null; relationship: string | null;
  createdAt: string;
}

export async function listTimelines(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: TimelineData[] }>(`/projects/${projectId}/timelines`);
  return data.data;
}

export async function createTimeline(projectId: string, input: { name: string; description?: string }) {
  const { data } = await api.post(`/projects/${projectId}/timelines`, input);
  return data.data;
}

export async function updateTimeline(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/timelines/${id}`, input);
  return data.data;
}

export async function deleteTimeline(id: string) {
  await api.delete(`/timelines/${id}`);
}

// --- TimelineEvent ---
export interface TimelineEventData {
  id: string; timelineId: string; projectId: string;
  title: string; description: string | null;
  date: string | null; approximateDate: string | null; relativeDate: string | null;
  duration: string | null; eventType: string; importance: number; status: string;
  location: { id: string; name: string } | null;
  causeEvent: { id: string; title: string } | null;
  causeEventId: string | null;
  sortOrder: number;
}

export async function listEvents(timelineId: string, projectId: string) {
  const { data } = await api.get<{ success: boolean; data: TimelineEventData[] }>(`/projects/${projectId}/timelines/${timelineId}/events`);
  return data.data;
}

export async function createEvent(projectId: string, timelineId: string, input: {
  title: string; description?: string; date?: string; eventType?: string;
  importance?: number; status?: string; locationId?: string; sortOrder?: number;
}) {
  const { data } = await api.post(`/projects/${projectId}/timelines/${timelineId}/events`, input);
  return data.data;
}

export async function updateEvent(id: string, input: Record<string, any>) {
  const { data } = await api.patch(`/timeline-events/${id}`, input);
  return data.data;
}

export async function deleteEvent(id: string) {
  await api.delete(`/timeline-events/${id}`);
}
