import api from "./client";

export interface DailyStatsData {
  id: string;
  projectId: string;
  date: string;
  totalWords: number;
  netWords: number;
  writingTimeSec: number;
  goalWords: number | null;
  goalMet: boolean;
}

export interface StatsSummary {
  today: { totalWords: number; netWords: number; writingTimeSec: number; goalWords: number | null; goalMet: boolean };
  totalWords: number;
  totalTimeSec: number;
  streak: number;
  totalChapters: number;
  dailyStats: DailyStatsData[];
}

export interface WritingSessionData {
  id: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  durationSec?: number;
  wordsWritten?: number;
  wpm?: number;
  chapterId?: string;
}

export async function getDailyStats(projectId: string, from?: string, to?: string) {
  const { data } = await api.get<{ success: boolean; data: DailyStatsData[] }>(
    `/projects/${projectId}/stats/daily`, { params: { from, to } },
  );
  return data.data;
}

export async function getSummary(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: StatsSummary }>(
    `/projects/${projectId}/stats/summary`,
  );
  return data.data;
}

export async function updateDailyStats(projectId: string, body: {
  date?: string;
  totalWords?: number;
  netWords?: number;
  writingTimeSec?: number;
  goalWords?: number;
}) {
  const { data } = await api.post<{ success: boolean; data: DailyStatsData }>(
    `/projects/${projectId}/stats/daily`, body,
  );
  return data.data;
}

export async function startSession(projectId: string, chapterId?: string) {
  const { data } = await api.post<{ success: boolean; data: WritingSessionData }>(
    `/projects/${projectId}/stats/sessions/start`, { chapterId },
  );
  return data.data;
}

export interface ChapterAnalysis {
  chapterId: string;
  chapterTitle: string;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  dialogueLines: number;
  dialogueCharCount: number;
  totalCharCount: number;
  dialogueRatio: number;
}

export interface WritingAnalysis {
  chapters: ChapterAnalysis[];
  overall: {
    totalWords: number;
    avgSentenceLength: number;
    avgDialogueRatio: number;
    chapterCount: number;
  };
  wordFrequency: { word: string; count: number }[];
  topPhrases: { phrase: string; count: number }[];
  charAppearances: { characterName: string; chapterCount: number; totalMentions: number }[];
}

export async function getAnalysis(projectId: string) {
  const { data } = await api.get<{ success: boolean; data: WritingAnalysis }>(
    `/projects/${projectId}/stats/analysis`,
  );
  return data.data;
}

export async function endSession(projectId: string, sessionId: string, body: { wordsWritten?: number; notes?: string }) {
  const { data } = await api.patch<{ success: boolean; data: WritingSessionData }>(
    `/projects/${projectId}/stats/sessions/${sessionId}/end`, body,
  );
  return data.data;
}
