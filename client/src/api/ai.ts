import api from "./client";

export interface BrainstormInput {
  context: string;
  type?: "what-next" | "character-development" | "plot-twist" | "world-building";
  constraints?: string[];
}

export interface ContinuityCheckInput {
  scope?: "chapter" | "character" | "project";
  entityId?: string;
  content?: string;
}

export interface StyleAssistInput {
  content: string;
  instruction?: "show-dont-tell" | "more-concise" | "more-descriptive" | "tense-fix";
}

export interface SummarizeInput {
  target: "chapter" | "character" | "location";
  entityId?: string;
  content?: string;
  style?: "brief" | "detailed" | "bullet-points";
}

export interface AiResult {
  result: string;
}

export async function aiAction(projectId: string, action: string, input: Record<string, unknown>): Promise<string> {
  const { data } = await api.post<{ success: boolean; data: AiResult }>(
    `/projects/${projectId}/ai/${action}`,
    input,
  );
  return data.data.result;
}

export function brainstorm(projectId: string, input: BrainstormInput) {
  return aiAction(projectId, "brainstorm", input as Record<string, unknown>);
}

export function continuityCheck(projectId: string, input: ContinuityCheckInput) {
  return aiAction(projectId, "continuity-check", input as Record<string, unknown>);
}

export function styleAssist(projectId: string, input: StyleAssistInput) {
  return aiAction(projectId, "style-assist", input as Record<string, unknown>);
}

export function summarize(projectId: string, input: SummarizeInput) {
  return aiAction(projectId, "summarize", input as Record<string, unknown>);
}
