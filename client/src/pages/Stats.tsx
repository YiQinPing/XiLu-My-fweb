import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, Flame, Clock, BookOpen, Pencil, Target, TrendingUp, Activity, Users, MessageSquare, Hash } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import * as statsApi from "@/api/stats";
import type { StatsSummary, WritingAnalysis } from "@/api/stats";
import { useProjectStore } from "@/stores/project";

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtWords(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString();
}

const tabs = [
  { id: "daily", label: "每日数据" },
  { id: "analysis", label: "写作分析" },
];

export function Stats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectId = globalProjectId || searchParams.get("project") || "";
  const [activeTab, setActiveTab] = useState("daily");

  // Daily stats
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [goalInput, setGoalInput] = useState(500);
  const [manualWords, setManualWords] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");

  // Analysis
  const [analysis, setAnalysis] = useState<WritingAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try { setSummary(await statsApi.getSummary(projectId)); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, [projectId]);

  const loadAnalysis = useCallback(async () => {
    if (!projectId) return;
    setAnalysisLoading(true);
    try { setAnalysis(await statsApi.getAnalysis(projectId)); }
    catch { /* ignore */ }
    finally { setAnalysisLoading(false); }
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (activeTab === "analysis") loadAnalysis(); }, [activeTab, loadAnalysis]);

  const handleSetGoal = async () => {
    if (!projectId || goalInput <= 0) return;
    try { await statsApi.updateDailyStats(projectId, { goalWords: goalInput }); refresh(); }
    catch { /* ignore */ }
  };

  const handleAddStats = async () => {
    if (!projectId) return;
    const words = parseInt(manualWords) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    if (words === 0 && minutes === 0) return;
    try {
      await statsApi.updateDailyStats(projectId, { totalWords: words, writingTimeSec: minutes * 60, goalWords: goalInput });
      setManualWords(""); setManualMinutes(""); refresh();
    } catch { /* ignore */ }
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <BarChart3 size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看数据</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  const chartData = (summary?.dailyStats || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    words: d.totalWords,
    time: Math.round(d.writingTimeSec / 60),
  }));

  // Calendar heatmap
  const today = new Date();
  const heatMapDays: { date: Date; words: number; isFuture: boolean }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const stat = summary?.dailyStats?.find((s) => new Date(s.date).toDateString() === d.toDateString());
    heatMapDays.push({ date: d, words: stat?.totalWords || 0, isFuture: d > today });
  }

  const getHeatColor = (words: number, isFuture: boolean): string => {
    if (isFuture) return "var(--bg-secondary)";
    if (words === 0) return "var(--surface)";
    if (words < 200) return "rgba(74,158,255,0.15)";
    if (words < 500) return "rgba(74,158,255,0.3)";
    if (words < 1000) return "rgba(74,158,255,0.45)";
    if (words < 2000) return "rgba(74,158,255,0.65)";
    return "rgba(74,158,255,0.85)";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-6">
        <BarChart3 size={20} style={{ color: "var(--accent)" }} />
        <h1 className="text-lg font-light flex-1" style={{ color: "var(--text-primary)" }}>数据与分析</h1>
        <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px]"
            style={{
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
              borderColor: activeTab === tab.id ? "var(--accent)" : "transparent",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        {/* ==================== 每日数据 ==================== */}
        {activeTab === "daily" && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl py-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Pencil, label: "总字数", value: fmtWords(summary?.totalWords || 0), color: "var(--accent)" },
                  { icon: TrendingUp, label: "今日字数", value: fmtWords(summary?.today?.totalWords || 0), color: "#6cc070" },
                  { icon: Flame, label: "连续天数", value: `${summary?.streak || 0} 天`, color: "#e8a87c" },
                  { icon: Clock, label: "写作时长", value: fmtTime(summary?.totalTimeSec || 0), color: "#9b7ec4" },
                ].map((card, i) => (
                  <div key={i} className="rounded-lg p-4" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <card.icon size={14} style={{ color: card.color }} />
                      <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{card.label}</span>
                    </div>
                    <span className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{card.value}</span>
                  </div>
                ))}
              </div>

              {/* Word Count Trend */}
              <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                <h3 className="text-xs font-medium mb-4" style={{ color: "var(--text-secondary)" }}>字数趋势（近7天）</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)" }} />
                      <Line type="monotone" dataKey="words" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4, fill: "var(--accent)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-center py-8" style={{ color: "var(--text-secondary)" }}>尚无数据</p>
                )}
              </div>

              {/* Calendar Heatmap */}
              <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                <h3 className="text-xs font-medium mb-3" style={{ color: "var(--text-secondary)" }}>写作热力图（近90天）</h3>
                <div className="flex flex-wrap gap-0.5">
                  {heatMapDays.map((d, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm transition-colors" style={{ backgroundColor: getHeatColor(d.words, d.isFuture) }}
                      title={`${d.date.toLocaleDateString("zh-CN")}: ${d.words} 字`} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                  <span>少</span>
                  {[0, 200, 500, 1000, 2000].map((w, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(w + 1, false) }} />
                  ))}
                  <span>多</span>
                </div>
              </div>

              {/* Goal & Manual Entry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={14} style={{ color: "var(--accent)" }} />
                    <h3 className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>每日目标</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={goalInput} onChange={(e) => setGoalInput(parseInt(e.target.value) || 0)}
                      className="w-24 rounded-md px-3 py-1.5 text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>字/天</span>
                    <button onClick={handleSetGoal} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>设定</button>
                  </div>
                  {summary?.today?.goalWords && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${Math.min(100, ((summary?.today?.totalWords || 0) / summary.today.goalWords) * 100)}%`,
                          backgroundColor: (summary?.today?.totalWords || 0) >= summary.today.goalWords ? "#6cc070" : "var(--accent)",
                        }} />
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                        {Math.round(((summary?.today?.totalWords || 0) / summary.today.goalWords) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={14} style={{ color: "var(--accent)" }} />
                    <h3 className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>手动记录</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={manualWords} onChange={(e) => setManualWords(e.target.value)} placeholder="字数"
                      className="w-24 rounded-md px-3 py-1.5 text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <input type="number" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} placeholder="分钟"
                      className="w-20 rounded-md px-3 py-1.5 text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                    <button onClick={handleAddStats} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>记录</button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ==================== 写作分析 ==================== */}
        {activeTab === "analysis" && (
          analysisLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
            </div>
          ) : !analysis || analysis.chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Activity size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有章节内容可供分析</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-5xl py-6">
              {/* Overall stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Pencil, label: "总字数", value: fmtWords(analysis.overall.totalWords), color: "var(--accent)" },
                  { icon: Hash, label: "章节数", value: `${analysis.overall.chapterCount}`, color: "#6cc070" },
                  { icon: Activity, label: "平均句长", value: `${analysis.overall.avgSentenceLength} 字`, color: "#e8a87c" },
                  { icon: MessageSquare, label: "对话占比", value: `${analysis.overall.avgDialogueRatio}%`, color: "#9b7ec4" },
                ].map((card, i) => (
                  <div key={i} className="rounded-lg p-4" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <card.icon size={14} style={{ color: card.color }} />
                      <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{card.label}</span>
                    </div>
                    <span className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{card.value}</span>
                  </div>
                ))}
              </div>

              {/* Chapter word count chart */}
              <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                <h3 className="text-xs font-medium mb-4" style={{ color: "var(--text-secondary)" }}>各章字数分布</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analysis.chapters.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="chapterTitle" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)" }} />
                    <Bar dataKey="wordCount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dialogue ratio per chapter */}
              <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                <h3 className="text-xs font-medium mb-4" style={{ color: "var(--text-secondary)" }}>各章对话占比</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analysis.chapters.slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="chapterTitle" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)" }} />
                    <Line type="monotone" dataKey="dialogueRatio" stroke="#e8a87c" strokeWidth={2} dot={{ r: 4, fill: "#e8a87c" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Character appearances */}
              {analysis.charAppearances.length > 0 && (
                <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={14} style={{ color: "#6cc070" }} />
                    <h3 className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>人物出场分析</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.charAppearances.slice(0, 10).map((char) => (
                      <div key={char.characterName} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-24 truncate" style={{ color: "var(--text-primary)" }}>{char.characterName}</span>
                        <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
                          <div className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                            style={{
                              width: `${Math.min(100, (char.totalMentions / (analysis.charAppearances[0]?.totalMentions || 1)) * 100)}%`,
                              backgroundColor: "rgba(74,158,255,0.6)",
                            }}>
                          </div>
                        </div>
                        <span className="text-[10px] w-20 text-right" style={{ color: "var(--text-secondary)" }}>
                          {char.totalMentions}次 / {char.chapterCount}章
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top frequent words */}
              {analysis.wordFrequency.length > 0 && (
                <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Hash size={14} style={{ color: "#9b7ec4" }} />
                    <h3 className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>高频词 Top 30</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.wordFrequency.map((w) => (
                      <span key={w.word} className="rounded px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                          fontSize: `${Math.max(10, 10 + Math.log2(w.count))}px`,
                        }}>
                        {w.word} <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>{w.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
