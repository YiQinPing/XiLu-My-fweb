import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Lightbulb, Plus, Trash2, GitBranch, Eye, EyeOff, X } from "lucide-react";
import {
  listForeshadowings, createForeshadowing, updateForeshadowing, deleteForeshadowing,
  type ForeshadowingData,
} from "@/api/foreshadowing";
import { listProjects, type Project } from "@/api/project";
import { ProjectSelector } from "@/components/shared/ProjectSelector";

const TYPE_LABELS: Record<string, string> = {
  DETAIL: "细节", DIALOGUE: "对话", ACTION: "行为", SETTING: "场景", CHARACTER_TRAIT: "人物特征", SYMBOL: "象征",
};
const SCOPE_LABELS: Record<string, string> = {
  LINE_LEVEL: "单行", CHAPTER_LEVEL: "章节", ARC_LEVEL: "弧", BOOK_LEVEL: "全书", SERIES_LEVEL: "系列",
};
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  PLANTED: { label: "已埋设", color: "#4a9eff", icon: GitBranch },
  DEVELOPING: { label: "发展中", color: "#f0c75e", icon: Eye },
  REVEALED: { label: "已揭示", color: "#6cc070", icon: EyeOff },
  ABANDONED: { label: "已废弃", color: "#999", icon: X },
};
const AWARENESS_LABELS: Record<string, string> = {
  SHARP_READERS: "给细心读者", REREADERS: "给重读者", ALL_READERS: "给所有读者",
};

export function Foreshadowing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [items, setItems] = useState<ForeshadowingData[]>([]);
  const [loading, setLoading] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "DETAIL", scope: "CHAPTER_LEVEL",
    plantingMethod: "", importance: 3,
  });

  useEffect(() => { listProjects().then(setProjects).catch(() => {}); }, []);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try { setItems(await listForeshadowings(projectId)); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async () => {
    if (!form.title.trim() || !projectId) return;
    await createForeshadowing(projectId, {
      title: form.title.trim(),
      description: form.description || undefined,
      type: form.type,
      scope: form.scope,
      plantingMethod: form.plantingMethod || undefined,
      importance: form.importance,
    });
    setForm({ title: "", description: "", type: "DETAIL", scope: "CHAPTER_LEVEL", plantingMethod: "", importance: 3 });
    setShowCreate(false);
    refresh();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateForeshadowing(id, { status });
    refresh();
  };

  const stats = {
    total: items.length,
    planted: items.filter((i) => i.status === "PLANTED").length,
    developing: items.filter((i) => i.status === "DEVELOPING").length,
    revealed: items.filter((i) => i.status === "REVEALED").length,
    abandoned: items.filter((i) => i.status === "ABANDONED").length,
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Lightbulb size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看伏笔</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部 */}
      <div className="flex items-center gap-4 px-8 py-6">
        <h1 className="text-2xl font-light flex-1" style={{ color: "var(--text-primary)" }}>
          {projects.find((p) => p.id === projectId)?.title} · 伏笔设计
        </h1>
        <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
          <Plus size={14} />新建伏笔
        </button>
      </div>

      {/* 统计 */}
      {items.length > 0 && (
        <div className="flex gap-4 px-8 mb-4 flex-wrap">
          {[
            { label: "全部", count: stats.total, color: "var(--text-primary)" },
            { label: "已埋设", count: stats.planted, color: "#4a9eff" },
            { label: "发展中", count: stats.developing, color: "#f0c75e" },
            { label: "已揭示", count: stats.revealed, color: "#6cc070" },
            { label: "已废弃", count: stats.abandoned, color: "#999" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg px-4 py-2" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <span className="text-lg font-medium" style={{ color: s.color }}>{s.count}</span>
              <span className="text-[10px] ml-1.5" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 列表 */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Lightbulb size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有伏笔</p>
            <button onClick={() => setShowCreate(true)} className="mt-2 text-xs" style={{ color: "var(--accent)" }}>创建第一个伏笔</button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.PLANTED;
              const StatusIcon = status.icon;
              return (
                <div key={item.id} className="rounded-lg p-4 animate-fade-in group"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                  {/* 头部 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
                        {item.importance >= 7 && <span className="text-xs" title="重要伏笔">★</span>}
                      </div>
                      {item.description && (
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>
                          {item.description.length > 80 ? item.description.slice(0, 80) + "..." : item.description}
                        </p>
                      )}
                    </div>
                    <button onClick={async () => { if (confirm("确定删除此伏笔？")) { await deleteForeshadowing(item.id); refresh(); } }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:brightness-90 flex-shrink-0">
                      <Trash2 size={12} style={{ color: "#c1554b" }} />
                    </button>
                  </div>

                  {/* 标签区 */}
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <span className="text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: status.color + "22", color: status.color }}>
                      <StatusIcon size={10} className="inline mr-0.5" />{status.label}
                    </span>
                    {TYPE_LABELS[item.type] && (
                      <span className="text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                        {TYPE_LABELS[item.type]}
                      </span>
                    )}
                    <span className="text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      {SCOPE_LABELS[item.scope] || item.scope}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
                      {AWARENESS_LABELS[item.targetAwareness] || item.targetAwareness}
                    </span>
                  </div>

                  {/* 线索链 + 章节 */}
                  {(item.childForeshadowings.length > 0 || item.parentForeshadowing || item.plantedChapter || item.revealedChapter) && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                      {item.parentForeshadowing && (
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          上级线索：{item.parentForeshadowing.title}
                        </p>
                      )}
                      {item.childForeshadowings.length > 0 && (
                        <p className="text-[10px]" style={{ color: "var(--accent)" }}>
                          下级线索：{item.childForeshadowings.map((c) => c.title).join("、")}
                        </p>
                      )}
                      {item.plantedChapter && (
                        <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          埋设：{item.plantedChapter.title}
                        </p>
                      )}
                      {item.revealedChapter && (
                        <p className="text-[10px]" style={{ color: "#6cc070" }}>
                          揭示：{item.revealedChapter.title}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 状态操作 */}
                  <div className="mt-3 pt-2 border-t flex gap-1" style={{ borderColor: "var(--border)" }}>
                    {["PLANTED", "DEVELOPING", "REVEALED", "ABANDONED"].map((s) => {
                      const sc = STATUS_CONFIG[s];
                      const active = item.status === s;
                      return (
                        <button key={s} onClick={() => handleStatusChange(item.id, s)}
                          className="text-[10px] rounded px-1.5 py-0.5 transition-all"
                          style={{
                            backgroundColor: active ? sc.color + "22" : "transparent",
                            color: active ? sc.color : "var(--text-secondary)",
                            opacity: active ? 1 : 0.5,
                          }}>
                          {sc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 新建弹窗 */}
      {showCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-md rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>新建伏笔</h2>
                <button onClick={() => setShowCreate(false)} className="p-1"><X size={16} style={{ color: "var(--text-secondary)" }} /></button>
              </div>

              <div className="space-y-3">
                <input autoFocus type="text" placeholder="伏笔标题（如：老铁匠手臂上的疤痕）" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                <textarea placeholder="描述（可选）—— 这个伏笔意味着什么？" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>类型</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>作用范围</label>
                    <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                      {Object.entries(SCOPE_LABELS).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                    </select>
                  </div>
                </div>

                <input type="text" placeholder="埋设方式（可选，如：不经意提及）" value={form.plantingMethod}
                  onChange={(e) => setForm({ ...form, plantingMethod: e.target.value })}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                <div>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>重要程度</label>
                  <div className="flex gap-2">
                    {[1, 3, 5, 7, 9].map((v) => (
                      <button key={v} onClick={() => setForm({ ...form, importance: v })}
                        className="rounded-md px-2 py-1 text-[10px] transition-all"
                        style={{
                          backgroundColor: form.importance === v ? "var(--accent)" : "var(--bg-primary)",
                          color: form.importance === v ? "#fff" : "var(--text-secondary)",
                          border: "1px solid " + (form.importance === v ? "var(--accent)" : "var(--border)"),
                        }}>
                        {v >= 7 ? "★" : "·"} {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleCreate} disabled={!form.title.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: !form.title.trim() ? 0.6 : 1 }}>创建</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
