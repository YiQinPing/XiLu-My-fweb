import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
}

function countSentences(text: string): number {
  const sentences = text.split(/[。！？!?…\n]+/).filter((s) => s.trim().length > 0);
  return sentences.length || 1;
}

interface ChapterAnalysis {
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

export async function analyzeChapters(projectId: string): Promise<{
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
}> {
  const chapters = await prisma.chapter.findMany({
    where: { volume: { projectId } },
    include: { volume: true },
    orderBy: { sortOrder: "asc" },
  });

  // Character names to search for
  const characters = await prisma.character.findMany({
    where: { projectId },
    select: { id: true, name: true },
  });

  const chapterAnalyses: ChapterAnalysis[] = [];
  const wordFreq: Record<string, number> = {};
  const phraseFreq: Record<string, number> = {};
  const charMentions: Record<string, { chapterCount: number; totalMentions: number }> = {};

  for (const ch of chapters) {
    const plainText = stripHtml(ch.content || "");
    const sentences = countSentences(plainText);
    const chars = plainText.replace(/\s/g, "").length;

    // Count dialogue: lines between quotes
    const dialogueMatches = plainText.match(/["「『].*?["」』]/g) || [];
    const dialogueText = dialogueMatches.join("");
    const dialogueChars = dialogueText.replace(/\s/g, "").length;

    chapterAnalyses.push({
      chapterId: ch.id,
      chapterTitle: ch.title || `第${ch.chapterNumber}章`,
      wordCount: chars,
      sentenceCount: sentences,
      avgSentenceLength: Math.round(chars / sentences),
      dialogueLines: dialogueMatches.length,
      dialogueCharCount: dialogueChars,
      totalCharCount: chars,
      dialogueRatio: chars > 0 ? Math.round((dialogueChars / chars) * 100) : 0,
    });

    // Word frequency (2-char Chinese words)
    const words = plainText.replace(/[^一-鿿]/g, "");
    for (let i = 0; i < words.length - 1; i++) {
      const word = words.slice(i, i + 2);
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    // Simple phrase detection (3-gram)
    for (let i = 0; i < words.length - 4; i++) {
      const phrase = words.slice(i, i + 4);
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    }

    // Character mentions
    for (const char of characters) {
      const regex = new RegExp(char.name, "g");
      const mentions = (plainText.match(regex) || []).length;
      if (mentions > 0) {
        if (!charMentions[char.name]) {
          charMentions[char.name] = { chapterCount: 0, totalMentions: 0 };
        }
        charMentions[char.name].chapterCount++;
        charMentions[char.name].totalMentions += mentions;
      }
    }
  }

  const totalWords = chapterAnalyses.reduce((s, c) => s + c.wordCount, 0);
  const avgSentenceLength = chapterAnalyses.length > 0
    ? Math.round(chapterAnalyses.reduce((s, c) => s + c.avgSentenceLength, 0) / chapterAnalyses.length)
    : 0;
  const avgDialogueRatio = chapterAnalyses.length > 0
    ? Math.round(chapterAnalyses.reduce((s, c) => s + c.dialogueRatio, 0) / chapterAnalyses.length)
    : 0;

  // Filter word frequency: only words appearing > 5 times
  const frequentWords = Object.entries(wordFreq)
    .filter(([, count]) => count > 5)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));

  // Top repeated phrases (appearing > 3 times)
  const topPhrases = Object.entries(phraseFreq)
    .filter(([, count]) => count > 3)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([phrase, count]) => ({ phrase, count }));

  // Character appearances sorted
  const charAppearances = Object.entries(charMentions)
    .map(([characterName, data]) => ({ characterName, ...data }))
    .sort((a, b) => b.totalMentions - a.totalMentions);

  return {
    chapters: chapterAnalyses,
    overall: {
      totalWords,
      avgSentenceLength,
      avgDialogueRatio,
      chapterCount: chapters.length,
    },
    wordFrequency: frequentWords,
    topPhrases,
    charAppearances,
  };
}
