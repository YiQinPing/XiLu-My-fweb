import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, ChevronRight, ChevronDown, FileText, BookOpen, X } from "lucide-react";
import { listOutline, createOutlineBeat, updateOutlineBeat, deleteOutlineBeat, applyTemplate, structureTemplates, type OutlineBeat, type BeatType } from "@/api/outline";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import { useProjectStore } from "@/stores/project";

const beatTypeLabels: Record<BeatType, string> = { ACT: "幕", SEQUENCE: "序列", SCENE: "场景", BEAT: "节拍" };
const beatTypeColors: Record<BeatType, string> = { ACT: "#c8966c", SEQUENCE: "#8b6f47", SCENE: "#6a8caf", BEAT: "#7ba870" };

function BeatTreeItem({
  beat, depth, selectedId, onSelect, onDelete,
}: {
  beat: OutlineBeat; depth: number; selectedId: string | null;
  onSelect: (beat: OutlineBeat) => void; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = beat.children.length > 0;

  return (
    <div>
      <button
        onClick={() => onSelect(beat)}
        className="flex w-full items-center gap-1 rounded px-2 py-1 text-left transition-colors hover:brightness-95 group"
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          backgroundColor: selectedId === beat.id ? "var(--surface)" : "transparent",
          borderLeft: selectedId === beat.id ? "2px solid var(--accent)" : "2px solid transparent",
        }}
      >
        {hasChildren ? (
          <span onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="flex-shrink-0 p-0.5">
            {expanded ? <ChevronDown size={12} style={{ color: "var(--text-secondary)" }} /> : <ChevronRight size={12} style={{ color: "var(--text-secondary)" }} />}
          </span>
        ) : <span className="w-4 flex-shrink-0" />}

        {beat.beatType && (
          <span className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
            style={{ backgroundColor: beatTypeColors[beat.beatType] + "22", color: beatTypeColors[beat.beatType] }}>
            {beatTypeLabels[beat.beatType]}
          </span>
        )}

        <span className="flex-1 truncate text-xs" style={{ color: "var(--text-primary)", fontWeight: depth === 0 ? 500 : 400 }}>
          {beat.title}
        </span>

        <span className="text-[9px] opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
          {beat.children.length > 0 ? `${beat.children.length}` : ""}
        </span>

        <span onClick={(e) => { e.stopPropagation(); onDelete(beat.id); }}
          className="p-0.5 rounded opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "#c1554b" }}>
          <Trash2 size={10} />
        </span>
      </button>

      {expanded && hasChildren && (
        <div>
          {beat.children.map((child) => (
            <BeatTreeItem key={child.id} beat={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Outline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectId = globalProjectId || searchParams.get("project") || "";
  const [beats, setBeats] = useState<OutlineBeat[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<OutlineBeat | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState<BeatType>("BEAT");
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    listOutline(projectId).then(setBeats).finally(() => setLoading(false));
  }, [projectId]);

  const fetchBeats = () => {
    if (!projectId) return;
    listOutline(projectId).then(setBeats);
  };

  const handleAdd = async (parentId: string | null, sortOrder: number, type: BeatType = "BEAT") => {
    if (!projectId) return;
    const title = prompt("节拍标题：");
    if (!title?.trim()) return;
    await createOutlineBeat(projectId, { title: title.trim(), parentId, sortOrder, beatType: parentId ? type : "ACT" });
    fetchBeats();
  };

  const handleEdit = async () => {
    if (!selectedBeat || !editTitle.trim()) return;
    await updateOutlineBeat(selectedBeat.id, { title: editTitle.trim(), description: editDesc.trim() || null, beatType: editType });
    fetchBeats();
    setSelectedBeat(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个节拍吗？子节拍也会被删除。")) return;
    await deleteOutlineBeat(id);
    if (selectedBeat?.id === id) setSelectedBeat(null);
    fetchBeats();
  };

  const handleApplyTemplate = async (templateName: string) => {
    if (!projectId) return;
    if (!confirm("应用模板会添加新的节拍到现有大纲中，确定继续？")) return;
    await applyTemplate(projectId, templateName);
    setShowTemplate(false);
    fetchBeats();
  };

  const selectBeat = (beat: OutlineBeat) => {
    setSelectedBeat(beat);
    setEditTitle(beat.title);
    setEditDesc(beat.description || "");
    setEditType(beat.beatType || "BEAT");
  };

  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <BookOpen size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看大纲</p>
        <ProjectSelector value="" onChange={(id) => setSearchParams({ project: id })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* ===== 左侧目录面板 ===== */}
      <div className="flex flex-col w-[300px] flex-shrink-0 border-r" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
        <div className="px-4 py-3 border-b space-y-2" style={{ borderColor: "var(--border)" }}>
          <ProjectSelector value={projectId} onChange={(id) => setSearchParams({ project: id })}
            className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          <div className="flex gap-1.5">
            <button onClick={() => handleAdd(null, beats.length, "ACT")}
              className="flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <Plus size={14} />添加幕
            </button>
            <button onClick={() => setShowTemplate(!showTemplate)}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-all"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              <FileText size={14} />模板
            </button>
          </div>
        </div>

        {showTemplate && (
          <div className="border-b p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
            {structureTemplates.map((t) => (
              <button key={t.name} onClick={() => handleApplyTemplate(t.name)}
                className="w-full rounded-md p-2 text-left transition-all hover:brightness-95"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{t.label}</span>
                <span className="block text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{t.description}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
            </div>
          ) : beats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <FileText size={32} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
              <p className="mt-2 text-xs text-center" style={{ color: "var(--text-secondary)" }}>还没有大纲节拍</p>
            </div>
          ) : (
            beats.map((beat) => (
              <BeatTreeItem key={beat.id} beat={beat} depth={0} selectedId={selectedBeat?.id || null}
                onSelect={selectBeat} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {/* ===== 右侧详情编辑面板 ===== */}
      <div className="flex-1 overflow-auto">
        {selectedBeat ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-8 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <h1 className="text-xl font-light flex-1" style={{ color: "var(--text-primary)" }}>编辑大纲</h1>
              <button onClick={() => setSelectedBeat(null)} className="p-1"><X size={18} style={{ color: "var(--text-secondary)" }} /></button>
            </div>

            <div className="flex-1 overflow-auto p-8">
              <div className="space-y-5 h-full flex flex-col" style={{ maxWidth: "900px" }}>
              {/* 类型选择器 */}
              <div>
                <label className="text-[10px] block mb-1.5" style={{ color: "var(--text-secondary)" }}>类型</label>
                <div className="flex gap-1.5">
                  {(Object.entries(beatTypeLabels) as [BeatType, string][]).map(([k, v]) => (
                    <button key={k} onClick={() => setEditType(k)}
                      className="rounded-md px-2.5 py-1 text-[10px] transition-all"
                      style={{
                        backgroundColor: editType === k ? beatTypeColors[k] : "var(--bg-secondary)",
                        color: editType === k ? "#fff" : "var(--text-secondary)",
                        border: `1px solid ${editType === k ? beatTypeColors[k] : "var(--border)"}`,
                      }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* 标题 */}
              <div>
                <label className="text-[10px] block mb-1.5" style={{ color: "var(--text-secondary)" }}>标题</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none font-medium"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>

              {/* 描述 */}
              <div className="flex-1 flex flex-col">
                <label className="text-[10px] block mb-1.5 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>描述</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="详细描述这个节拍的内容、关键事件、转折点、角色动机等..."
                  className="w-full flex-1 rounded-md px-3 py-2 text-sm outline-none resize-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: "320px" }} />
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-2 pt-2">
                <button onClick={handleEdit}
                  className="rounded-md px-6 py-2 text-sm font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}>保存</button>
                <button onClick={() => setSelectedBeat(null)}
                  className="rounded-md px-4 py-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}>取消</button>
                <div className="flex-1" />
                <button onClick={() => selectedBeat && handleDelete(selectedBeat.id)}
                  className="rounded-md px-3 py-2 text-sm flex items-center gap-1"
                  style={{ color: "#c1554b" }}>
                  <Trash2 size={14} />删除
                </button>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>从左侧目录树中选择一个节拍进行编辑</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>或点击"添加幕"创建新的大纲结构</p>
          </div>
        )}
      </div>
    </div>
  );
}
