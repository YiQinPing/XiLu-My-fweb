import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, Plus, Trash2, MapPin, ChevronRight, X, Calendar } from "lucide-react";
import {
  listTimelines, createTimeline, deleteTimeline,
  listEvents, createEvent, deleteEvent,
  type TimelineData, type TimelineEventData,
} from "@/api/timeline";
import { listProjects, type Project } from "@/api/project";

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "#4a9eff",
  HAPPENED: "#6cc070",
  ONGOING: "#f0c75e",
};

const IMPORTANCE_STARS: Record<number, string> = { 1: "·", 3: "··", 5: "···", 7: "✦", 9: "★" };

export function Timeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [timelines, setTimelines] = useState<TimelineData[]>([]);
  const [selectedTl, setSelectedTl] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [loading, setLoading] = useState(false);

  // Create modals
  const [showNewTl, setShowNewTl] = useState(false);
  const [tlName, setTlName] = useState("");
  const [showNewEv, setShowNewEv] = useState(false);
  const [evForm, setEvForm] = useState({ title: "", date: "", eventType: "GENERAL", description: "", importance: 3 });

  useEffect(() => { listProjects().then(setProjects).catch(() => {}); }, []);

  const loadTimelines = useCallback(async () => {
    if (!projectId) return;
    const tls = await listTimelines(projectId);
    setTimelines(tls);
    if (tls.length > 0 && !selectedTl) setSelectedTl(tls[0].id);
    return tls;
  }, [projectId]);

  const loadEvents = useCallback(async (tlId: string) => {
    if (!projectId) return;
    setLoading(true);
    try { setEvents(await listEvents(tlId, projectId)); }
    catch { setEvents([]); }
    finally { setLoading(false); }
  }, [projectId]);

  useEffect(() => { loadTimelines(); }, [loadTimelines]);

  useEffect(() => {
    if (selectedTl) loadEvents(selectedTl);
  }, [selectedTl, loadEvents]);

  const handleCreateTl = async () => {
    if (!tlName.trim() || !projectId) return;
    const tl = await createTimeline(projectId, { name: tlName.trim() });
    setTlName(""); setShowNewTl(false);
    await loadTimelines();
    setSelectedTl(tl.id);
  };

  const handleCreateEv = async () => {
    if (!evForm.title.trim() || !selectedTl || !projectId) return;
    await createEvent(projectId, selectedTl, {
      title: evForm.title.trim(),
      date: evForm.date || undefined,
      eventType: evForm.eventType,
      description: evForm.description || undefined,
      importance: evForm.importance,
    });
    setEvForm({ title: "", date: "", eventType: "GENERAL", description: "", importance: 3 });
    setShowNewEv(false);
    loadEvents(selectedTl);
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <Clock size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看时间线</p>
        <select value="" onChange={(e) => setSearchParams({ project: e.target.value })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
          <option value="" disabled>选择作品...</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.sortOrder - b.sortOrder;
  });

  return (
    <div className="flex h-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 左侧时间线列表 */}
      <div className="w-56 border-r flex flex-col flex-shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>时间线</h2>
          <button onClick={() => setShowNewTl(true)} className="p-1 rounded hover:brightness-90"
            style={{ backgroundColor: "var(--surface)" }}>
            <Plus size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-2 pb-2">
          {timelines.length === 0 ? (
            <p className="text-xs px-2 py-4 text-center" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
              暂无时间线，点击 + 创建
            </p>
          ) : (
            timelines.map((tl) => (
              <button key={tl.id} onClick={() => setSelectedTl(tl.id)}
                className="w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between group"
                style={{
                  backgroundColor: selectedTl === tl.id ? "var(--accent)" + "18" : "transparent",
                  color: selectedTl === tl.id ? "var(--accent)" : "var(--text-secondary)",
                }}>
                <span className="truncate flex-1">{tl.name}</span>
                <button onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm("确定删除此时间线？")) { await deleteTimeline(tl.id); setSelectedTl(null); loadTimelines(); }
                }} className="p-0.5 opacity-0 group-hover:opacity-100">
                  <Trash2 size={10} style={{ color: "#c1554b" }} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 右侧事件时间线 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部 */}
        <div className="flex items-center gap-4 px-8 py-4">
          <Clock size={18} style={{ color: "var(--text-secondary)" }} />
          <h1 className="text-lg font-light flex-1" style={{ color: "var(--text-primary)" }}>
            {projects.find((p) => p.id === projectId)?.title} · {timelines.find((t) => t.id === selectedTl)?.name || "时间线"}
          </h1>
          <select value={projectId} onChange={(e) => setSearchParams({ project: e.target.value })}
            className="rounded-md px-3 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
            {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
          </select>
          {selectedTl && (
            <button onClick={() => setShowNewEv(true)}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <Plus size={14} />添加事件
            </button>
          )}
        </div>

        {/* 时间线内容 */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          {!selectedTl ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Clock size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>选择或创建一个时间线</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有事件</p>
              <button onClick={() => setShowNewEv(true)} className="mt-2 text-xs" style={{ color: "var(--accent)" }}>
                添加第一个事件
              </button>
            </div>
          ) : (
            <div className="relative pl-8">
              {/* 中线 */}
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 rounded" style={{ backgroundColor: "var(--border)" }} />

              {sortedEvents.map((ev, idx) => {
                const color = STATUS_COLORS[ev.status] || "var(--text-secondary)";
                return (
                  <div key={ev.id} className="relative pb-8 last:pb-0 animate-fade-in" style={{ animationDelay: idx * 50 + "ms" }}>
                    {/* 圆点 */}
                    <div className="absolute left-[-25px] top-1 w-3 h-3 rounded-full border-2"
                      style={{ backgroundColor: "var(--bg-primary)", borderColor: color, boxShadow: ev.importance >= 7 ? "0 0 6px " + color : "none" }} />

                    {/* 内容卡片 */}
                    <div className="rounded-lg p-4 hover:brightness-95 transition-all"
                      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ev.title}</h3>
                            {ev.importance >= 7 && (
                              <span className="text-xs" title="重要事件">{IMPORTANCE_STARS[7]}</span>
                            )}
                            {ev.eventType !== "GENERAL" && (
                              <span className="text-[10px] rounded px-1.5 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{ev.eventType}</span>
                            )}
                          </div>
                          {ev.description && (
                            <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)", opacity: 0.7 }}>{ev.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {ev.date && (
                              <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--accent)" }}>
                                <Calendar size={10} />{ev.date}
                              </span>
                            )}
                            {ev.location && (
                              <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                                <MapPin size={10} />{ev.location.name}
                              </span>
                            )}
                            <span className="text-[10px] rounded px-1.5 py-0.5" style={{
                              backgroundColor: (STATUS_COLORS[ev.status] || "#999") + "22",
                              color: STATUS_COLORS[ev.status] || "#999",
                            }}>{ev.status === "PLANNED" ? "计划中" : ev.status === "HAPPENED" ? "已发生" : "进行中"}</span>
                          </div>
                        </div>
                        <button onClick={async () => {
                          if (confirm("确定删除此事件？")) { await deleteEvent(ev.id); loadEvents(selectedTl); }
                        }} className="p-1 rounded opacity-0 hover:opacity-100 hover:brightness-90 transition-opacity"
                        style={{ opacity: 0.3 }}>
                          <Trash2 size={12} style={{ color: "#c1554b" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 新建时间线弹窗 */}
      {showNewTl && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowNewTl(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>新建时间线</h2>
              <input autoFocus type="text" placeholder="时间线名称" value={tlName}
                onChange={(e) => setTlName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTl()}
                className="mt-4 w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowNewTl(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleCreateTl} disabled={!tlName.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: !tlName.trim() ? 0.6 : 1 }}>创建</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 新建事件弹窗 */}
      {showNewEv && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowNewEv(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-md rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>添加事件</h2>
                <button onClick={() => setShowNewEv(false)} className="p-1"><X size={16} style={{ color: "var(--text-secondary)" }} /></button>
              </div>

              <div className="space-y-3">
                <input autoFocus type="text" placeholder="事件标题" value={evForm.title}
                  onChange={(e) => setEvForm({ ...evForm, title: e.target.value })}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="日期（如：星历487年·夏）" value={evForm.date}
                    onChange={(e) => setEvForm({ ...evForm, date: e.target.value })}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                  <select value={evForm.eventType} onChange={(e) => setEvForm({ ...evForm, eventType: e.target.value })}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                    <option value="GENERAL">一般事件</option>
                    <option value="BATTLE">战斗</option>
                    <option value="POLITICAL">政治</option>
                    <option value="DISCOVERY">发现</option>
                    <option value="BIRTH">出生</option>
                    <option value="DEATH">死亡</option>
                    <option value="TURNING_POINT">转折点</option>
                    <option value="CEREMONY">仪式</option>
                  </select>
                </div>

                <textarea placeholder="描述（可选）" value={evForm.description}
                  onChange={(e) => setEvForm({ ...evForm, description: e.target.value })}
                  rows={2} className="w-full rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />

                <div>
                  <label className="text-[10px] block mb-1" style={{ color: "var(--text-secondary)" }}>重要程度</label>
                  <div className="flex gap-2">
                    {[1, 3, 5, 7, 9].map((v) => (
                      <button key={v} onClick={() => setEvForm({ ...evForm, importance: v })}
                        className="rounded-md px-2 py-1 text-[10px] transition-all"
                        style={{
                          backgroundColor: evForm.importance === v ? "var(--accent)" : "var(--bg-primary)",
                          color: evForm.importance === v ? "#fff" : "var(--text-secondary)",
                          border: "1px solid " + (evForm.importance === v ? "var(--accent)" : "var(--border)"),
                        }}>
                        {IMPORTANCE_STARS[v]} {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowNewEv(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleCreateEv} disabled={!evForm.title.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: !evForm.title.trim() ? 0.6 : 1 }}>添加</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
