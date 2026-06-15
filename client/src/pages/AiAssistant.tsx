import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Lightbulb, CheckCircle2, PenLine, FileText, Loader2 } from "lucide-react";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import * as aiApi from "@/api/ai";
import { useProjectStore } from "@/stores/project";

const tabs = [
  { id: "brainstorm", icon: Lightbulb, label: "头脑风暴" },
  { id: "continuity", icon: CheckCircle2, label: "连续性检查" },
  { id: "style", icon: PenLine, label: "风格润色" },
  { id: "summarize", icon: FileText, label: "智能摘要" },
];

export function AiAssistant() {
  const [searchParams, setSearchParams] = useSearchParams();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectId = globalProjectId || searchParams.get("project") || "";
  const [activeTab, setActiveTab] = useState("brainstorm");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [brainstormForm, setBrainstormForm] = useState({ context: "", type: "what-next" as const, constraints: "" });
  const [continuityForm, setContinuityForm] = useState({ scope: "chapter" as const, content: "" });
  const [styleForm, setStyleForm] = useState({ content: "", instruction: "show-dont-tell" as const });
  const [summarizeForm, setSummarizeForm] = useState({ target: "chapter" as const, content: "", style: "brief" as const });

  const handleAction = async (action: string, input: Record<string, unknown>) => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await aiApi.aiAction(projectId, action, input);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "AI 服务暂时不可用，请检查 API Key 配置");
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Sparkles size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以使用 AI 助手</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-6">
        <Sparkles size={20} style={{ color: "var(--accent)" }} />
        <h1 className="text-lg font-light flex-1" style={{ color: "var(--text-primary)" }}>AI 写作助手</h1>
        <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-8 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResult(""); setError(""); }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-[1px]"
            style={{
              color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
              borderColor: activeTab === tab.id ? "var(--accent)" : "transparent",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Brainstorm */}
          {activeTab === "brainstorm" && (
            <>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>当前情境 / 问题</label>
                <textarea
                  value={brainstormForm.context}
                  onChange={(e) => setBrainstormForm({ ...brainstormForm, context: e.target.value })}
                  placeholder="描述当前故事中的情境或你想解决的问题。例如：主角被困在敌方密室中，外面有守卫巡逻..."
                  rows={4}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>建议类型</label>
                  <select value={brainstormForm.type} onChange={(e) => setBrainstormForm({ ...brainstormForm, type: e.target.value as typeof brainstormForm.type })}
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="what-next">接下来发生什么</option>
                    <option value="character-development">角色发展方向</option>
                    <option value="plot-twist">情节反转</option>
                    <option value="world-building">世界观扩展</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>约束条件（用逗号分隔）</label>
                  <input type="text" value={brainstormForm.constraints} onChange={(e) => setBrainstormForm({ ...brainstormForm, constraints: e.target.value })}
                    placeholder="不使用魔法, 保持主角性格..."
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <button
                onClick={() => handleAction("brainstorm", {
                  context: brainstormForm.context,
                  type: brainstormForm.type,
                  constraints: brainstormForm.constraints ? brainstormForm.constraints.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
                })}
                disabled={loading || !brainstormForm.context.trim()}
                className="flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
                生成建议
              </button>
            </>
          )}

          {/* Continuity Check */}
          {activeTab === "continuity" && (
            <>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>检查范围</label>
                <select value={continuityForm.scope} onChange={(e) => setContinuityForm({ ...continuityForm, scope: e.target.value as typeof continuityForm.scope })}
                  className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="chapter">章节</option>
                  <option value="character">人物</option>
                  <option value="project">全书</option>
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>待检查的内容</label>
                <textarea
                  value={continuityForm.content}
                  onChange={(e) => setContinuityForm({ ...continuityForm, content: e.target.value })}
                  placeholder="粘贴需要检查的章节或段落内容..."
                  rows={8}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <button
                onClick={() => handleAction("continuity-check", { scope: continuityForm.scope, content: continuityForm.content || undefined })}
                disabled={loading || !continuityForm.content.trim()}
                className="flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                开始检查
              </button>
            </>
          )}

          {/* Style Assist */}
          {activeTab === "style" && (
            <>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>原文</label>
                <textarea
                  value={styleForm.content}
                  onChange={(e) => setStyleForm({ ...styleForm, content: e.target.value })}
                  placeholder="粘贴需要润色的文字..."
                  rows={6}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>润色方向</label>
                <select value={styleForm.instruction} onChange={(e) => setStyleForm({ ...styleForm, instruction: e.target.value as typeof styleForm.instruction })}
                  className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                  <option value="show-dont-tell">展示而非告知 (Show, Don't Tell)</option>
                  <option value="more-concise">精简表达</option>
                  <option value="more-descriptive">增强描写</option>
                  <option value="tense-fix">统一时态</option>
                </select>
              </div>
              <button
                onClick={() => handleAction("style-assist", { content: styleForm.content, instruction: styleForm.instruction })}
                disabled={loading || !styleForm.content.trim()}
                className="flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <PenLine size={16} />}
                开始润色
              </button>
            </>
          )}

          {/* Summarize */}
          {activeTab === "summarize" && (
            <>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>目标类型</label>
                  <select value={summarizeForm.target} onChange={(e) => setSummarizeForm({ ...summarizeForm, target: e.target.value as typeof summarizeForm.target })}
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="chapter">章节</option>
                    <option value="character">人物</option>
                    <option value="location">地点</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>摘要风格</label>
                  <select value={summarizeForm.style} onChange={(e) => setSummarizeForm({ ...summarizeForm, style: e.target.value as typeof summarizeForm.style })}
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="brief">简洁 (100-200字)</option>
                    <option value="detailed">详细 (300-500字)</option>
                    <option value="bullet-points">要点列表</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: "var(--text-secondary)" }}>原文内容</label>
                <textarea
                  value={summarizeForm.content}
                  onChange={(e) => setSummarizeForm({ ...summarizeForm, content: e.target.value })}
                  placeholder="粘贴需要生成摘要的内容..."
                  rows={8}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <button
                onClick={() => handleAction("summarize", { target: summarizeForm.target, content: summarizeForm.content || undefined, style: summarizeForm.style })}
                disabled={loading || !summarizeForm.content.trim()}
                className="flex items-center gap-2 rounded-md px-6 py-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                生成摘要
              </button>
            </>
          )}

          {/* Result */}
          {error && (
            <div className="rounded-md px-4 py-3 text-sm" style={{ backgroundColor: "rgba(193,85,75,0.1)", color: "#c1554b", border: "1px solid rgba(193,85,75,0.2)" }}>
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
