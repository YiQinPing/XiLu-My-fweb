import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Lightbulb, Plus, Trash2, Edit3, Shuffle, ChevronUp, Filter, X, Sparkles } from "lucide-react";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import * as inspirationApi from "@/api/inspiration";
import type { InspirationData, CreateInspirationInput } from "@/api/inspiration";
import { useProjectStore } from "@/stores/project";

const sourceLabels: Record<string, string> = {
  DREAM: "梦", READING: "阅读", CONVERSATION: "对话", OBSERVATION: "观察",
  SHOWER: "淋浴灵感", IMAGE: "图片", MUSIC: "音乐", RESEARCH: "调研",
  WRITING_EXERCISE: "写作练习", RANDOM: "随机", OTHER: "其他",
};

const statusCfg: Record<string, { label: string; color: string; bg: string }> = {
  RAW: { label: "原始", color: "#9b7ec4", bg: "rgba(155,126,196,0.12)" },
  DEVELOPING: { label: "发展中", color: "#4a9eff", bg: "rgba(74,158,255,0.12)" },
  READY: { label: "就绪", color: "#6cc070", bg: "rgba(108,192,112,0.12)" },
  ADOPTED: { label: "已采用", color: "#f0c75e", bg: "rgba(240,199,94,0.12)" },
  ARCHIVED: { label: "归档", color: "#999", bg: "rgba(153,153,153,0.1)" },
};

const priorityLabels = ["", "很低", "低", "中", "高", "很重要"];

export function Inspiration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectId = globalProjectId || searchParams.get("project") || "";
  const [items, setItems] = useState<InspirationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [randomPrompt, setRandomPrompt] = useState<{ prompt: string; category: string } | null>(null);

  // Quick capture
  const [quickContent, setQuickContent] = useState("");
  const [quickTags, setQuickTags] = useState("");
  const [capturing, setCapturing] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");

  // Edit modal
  const [editing, setEditing] = useState<InspirationData | null>(null);
  const [editForm, setEditForm] = useState<CreateInspirationInput>({ content: "" });

  // Promote
  const [promoting, setPromoting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      setItems(await inspirationApi.listInspirations(projectId, {
        status: filterStatus || undefined,
        sourceType: filterSource || undefined,
      }));
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [projectId, filterStatus, filterSource]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleQuickCapture = async () => {
    if (!quickContent.trim() || !projectId) return;
    setCapturing(true);
    try {
      await inspirationApi.createInspiration(projectId, {
        content: quickContent.trim(),
        tags: quickTags.split(/[,，\s]+/).filter(Boolean),
        sourceType: "OTHER",
      });
      setQuickContent("");
      setQuickTags("");
      refresh();
    } catch { /* ignore */ }
    finally { setCapturing(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条灵感？")) return;
    try {
      await inspirationApi.deleteInspiration(projectId, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ }
  };

  const handleEdit = (item: InspirationData) => {
    setEditing(item);
    setEditForm({
      title: item.title || "",
      content: item.content,
      sourceType: item.sourceType,
      sourceDetail: item.sourceDetail || "",
      tags: JSON.parse(item.tags || "[]"),
      status: item.status,
      priority: item.priority,
      folder: item.folder || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editing || !projectId) return;
    try {
      await inspirationApi.updateInspiration(projectId, editing.id, editForm);
      setEditing(null);
      refresh();
    } catch { /* ignore */ }
  };

  const handlePromote = async (id: string, target: string) => {
    try {
      await inspirationApi.promoteInspiration(projectId, id, target);
      setPromoting(null);
      alert(`灵感已提升为${target === "character" ? "人物" : target === "chapter" ? "章节" : target === "outline" ? "大纲" : target === "location" ? "地点" : target === "timeline_event" ? "时间线事件" : "伏笔"}`);
      refresh();
    } catch { /* ignore */ }
  };

  const handleRandom = async () => {
    if (!projectId) return;
    try {
      setRandomPrompt(await inspirationApi.getRandomPrompt(projectId));
    } catch { /* ignore */ }
  };

  const handleAdoptPrompt = () => {
    if (!randomPrompt) return;
    setQuickContent(randomPrompt.prompt);
    setRandomPrompt(null);
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Lightbulb size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看灵感</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  const parseTags = (tagsStr: string): string[] => {
    try { return JSON.parse(tagsStr || "[]"); }
    catch { return []; }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-6">
        <Lightbulb size={20} style={{ color: "var(--accent)" }} />
        <h1 className="text-lg font-light flex-1" style={{ color: "var(--text-primary)" }}>灵感</h1>
        <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>

      {/* Quick Capture + Random Prompt */}
      <div className="px-8 pb-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickCapture()}
              placeholder="快速记录一个想法...（按 Enter 保存）"
              className="w-full rounded-lg pl-4 pr-4 py-2.5 text-sm outline-none"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>
          <input
            type="text"
            value={quickTags}
            onChange={(e) => setQuickTags(e.target.value)}
            placeholder="标签（逗号分隔）"
            className="w-40 rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <button onClick={handleQuickCapture} disabled={capturing || !quickContent.trim()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            <Plus size={16} />
            记录
          </button>
          <button onClick={handleRandom}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition-all hover:brightness-95"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <Shuffle size={16} />
          </button>
        </div>

        {/* Random Prompt Display */}
        {randomPrompt && (
          <div className="rounded-lg p-3 flex items-start gap-3" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
            <Sparkles size={16} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
            <div className="flex-1">
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{randomPrompt.prompt}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>
                {randomPrompt.category === "writing-prompt" ? "写作提示" : randomPrompt.category === "what-if" ? "What-if" : "约束写作"}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={handleAdoptPrompt}
                className="rounded px-2 py-1 text-[10px] font-medium"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}>采用</button>
              <button onClick={() => setRandomPrompt(null)}
                className="rounded px-2 py-1 text-[10px]"
                style={{ color: "var(--text-secondary)" }}>忽略</button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-8 pb-4">
        <Filter size={12} style={{ color: "var(--text-secondary)" }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded px-2 py-1 text-[10px] outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <option value="">全部状态</option>
          {Object.entries(statusCfg).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}
          className="rounded px-2 py-1 text-[10px] outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <option value="">全部来源</option>
          {Object.entries(sourceLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex-1" />
        <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{items.length} 条灵感</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Lightbulb size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有灵感，快速记录你的第一个想法吧</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const tags = parseTags(item.tags);
              const st = statusCfg[item.status] || statusCfg.RAW;
              return (
                <div key={item.id} className="rounded-lg p-4 transition-all hover:scale-[1.01] group"
                  style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] rounded px-1.5 py-0.5 font-medium flex-shrink-0"
                        style={{ backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                      {item.priority >= 4 && (
                        <span className="text-[10px]" style={{ color: "#f0c75e" }}>{Array(item.priority).fill("").map((_, i) => <ChevronUp key={i} size={8} className="inline" />)}</span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => handleEdit(item)} className="p-0.5 rounded" style={{ color: "var(--text-secondary)" }}>
                        <Edit3 size={12} />
                      </button>
                      <div className="relative">
                        <button onClick={() => setPromoting(promoting === item.id ? null : item.id)}
                          className="p-0.5 rounded" style={{ color: "var(--accent)" }} title="提升为正式内容">
                          <ChevronUp size={12} />
                        </button>
                        {promoting === item.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setPromoting(null)} />
                            <div className="absolute right-0 top-5 z-20 w-28 rounded-md py-1 shadow-lg"
                              style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
                              {[
                                { k: "chapter", l: "章节" },
                                { k: "character", l: "人物" },
                                { k: "outline", l: "大纲" },
                                { k: "location", l: "地点" },
                              ].map(({ k, l }) => (
                                <button key={k} onClick={() => handlePromote(item.id, k)}
                                  className="block w-full text-left px-3 py-1 text-[10px] hover:brightness-110"
                                  style={{ color: "var(--text-primary)" }}>{l}</button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="p-0.5 rounded" style={{ color: "#c1554b" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  {item.title && <h3 className="text-sm font-medium mt-2" style={{ color: "var(--text-primary)" }}>{item.title}</h3>}
                  <p className="text-xs mt-1.5 leading-relaxed line-clamp-4" style={{ color: "var(--text-secondary)" }}>
                    {item.content}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {tags.map((tag, i) => (
                      <span key={i} className="text-[10px] rounded px-1.5 py-0.5"
                        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{tag}</span>
                    ))}
                    <span className="text-[10px] ml-auto flex-shrink-0" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                      {sourceLabels[item.sourceType] || item.sourceType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setEditing(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-lg rounded-lg p-6 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>编辑灵感</h2>
                <button onClick={() => setEditing(null)} className="p-1"><X size={16} style={{ color: "var(--text-secondary)" }} /></button>
              </div>
              <div className="space-y-3">
                <input type="text" value={editForm.title || ""} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="标题（可选）"
                  className="w-full rounded-md px-3 py-1.5 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={5} placeholder="内容"
                  className="w-full rounded-md px-3 py-1.5 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-secondary)" }}>状态</label>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full rounded px-2 py-1 text-[10px] outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      {Object.entries(statusCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-secondary)" }}>来源</label>
                    <select value={editForm.sourceType} onChange={(e) => setEditForm({ ...editForm, sourceType: e.target.value })}
                      className="w-full rounded px-2 py-1 text-[10px] outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-secondary)" }}>优先级 ({priorityLabels[editForm.priority || 3]})</label>
                    <input type="range" min="1" max="5" value={editForm.priority || 3} onChange={(e) => setEditForm({ ...editForm, priority: +e.target.value })}
                      className="w-full" style={{ accentColor: "var(--accent)" }} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] block mb-0.5" style={{ color: "var(--text-secondary)" }}>标签（逗号分隔）</label>
                  <input type="text" value={(editForm.tags || []).join(", ")} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(/[,，]+/).map((s) => s.trim()).filter(Boolean) })}
                    className="w-full rounded-md px-3 py-1.5 text-xs outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleSaveEdit} className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}>保存</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
