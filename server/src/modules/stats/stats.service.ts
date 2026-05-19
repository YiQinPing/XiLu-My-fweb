import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getDailyStats(projectId: string, from: string, to: string) {
  return prisma.dailyStats.findMany({
    where: {
      projectId,
      date: { gte: new Date(from), lte: new Date(to) },
    },
    orderBy: { date: "asc" },
  });
}

export async function getSummary(projectId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayStats, recentStats, allStats, totalChapters] = await Promise.all([
    prisma.dailyStats.findUnique({
      where: { projectId_date: { projectId, date: todayStart } },
    }),
    prisma.dailyStats.findMany({
      where: { projectId, date: { gte: sevenDaysAgo } },
      orderBy: { date: "asc" },
    }),
    prisma.dailyStats.findMany({
      where: { projectId },
      orderBy: { date: "desc" },
    }),
    prisma.chapter.count({ where: { volume: { projectId } } }),
  ]);

  // Calculate streak
  let streak = 0;
  const day = new Date(todayStart);
  for (const stat of [...allStats].sort((a, b) => b.date.getTime() - a.date.getTime())) {
    const statDate = new Date(stat.date);
    const expectedDate = new Date(day.getTime() - streak * 24 * 60 * 60 * 1000);
    if (statDate.toDateString() === expectedDate.toDateString() && stat.totalWords > 0) {
      streak++;
    } else if (statDate.toDateString() === new Date(todayStart.getTime() - (streak + 1) * 24 * 60 * 60 * 1000).toDateString() && stat.totalWords > 0) {
      streak++;
    } else {
      break;
    }
  }

  // Calculate streak properly
  let properStreak = 0;
  const checkDate = new Date(todayStart);
  while (true) {
    const found = allStats.find((s) => new Date(s.date).toDateString() === checkDate.toDateString());
    if (found && found.totalWords > 0) {
      properStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const totalWords = allStats.reduce((sum, s) => sum + s.totalWords, 0);
  const totalTimeSec = allStats.reduce((sum, s) => sum + s.writingTimeSec, 0);

  return {
    today: todayStats || { totalWords: 0, netWords: 0, writingTimeSec: 0, goalWords: null, goalMet: false },
    totalWords,
    totalTimeSec,
    streak: properStreak,
    totalChapters,
    dailyStats: recentStats,
  };
}

export async function upsertDailyStats(projectId: string, data: {
  date?: string;
  totalWords?: number;
  netWords?: number;
  writingTimeSec?: number;
  goalWords?: number;
}) {
  const dateStr = data.date || new Date().toISOString().slice(0, 10);
  const date = new Date(dateStr);

  const existing = await prisma.dailyStats.findUnique({
    where: { projectId_date: { projectId, date } },
  });

  if (existing) {
    return prisma.dailyStats.update({
      where: { projectId_date: { projectId, date } },
      data: {
        totalWords: data.totalWords !== undefined ? data.totalWords : existing.totalWords,
        netWords: data.netWords !== undefined ? data.netWords : existing.netWords,
        writingTimeSec: data.writingTimeSec !== undefined
          ? existing.writingTimeSec + data.writingTimeSec
          : existing.writingTimeSec,
        goalWords: data.goalWords !== undefined ? data.goalWords : existing.goalWords,
        goalMet: data.goalWords !== undefined
          ? (data.totalWords ?? existing.totalWords) >= data.goalWords
          : existing.goalMet,
      },
    });
  }

  return prisma.dailyStats.create({
    data: {
      projectId,
      date,
      totalWords: data.totalWords ?? 0,
      netWords: data.netWords ?? 0,
      writingTimeSec: data.writingTimeSec ?? 0,
      goalWords: data.goalWords ?? 500,
      goalMet: (data.totalWords ?? 0) >= (data.goalWords ?? 500),
    },
  });
}

export async function startWritingSession(projectId: string, chapterId?: string) {
  return prisma.writingSession.create({
    data: {
      projectId,
      chapterId,
      startTime: new Date(),
    },
  });
}

export async function endWritingSession(sessionId: string, data: {
  wordsWritten?: number;
  notes?: string;
}) {
  const session = await prisma.writingSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Writing session not found");

  const endTime = new Date();
  const durationSec = Math.round((endTime.getTime() - new Date(session.startTime).getTime()) / 1000);
  const wpm = durationSec > 0 && data.wordsWritten ? Math.round((data.wordsWritten / durationSec) * 60) : undefined;

  return prisma.writingSession.update({
    where: { id: sessionId },
    data: {
      endTime,
      durationSec,
      wordsWritten: data.wordsWritten ?? session.wordsWritten,
      wpm,
      notes: data.notes,
    },
  });
}
