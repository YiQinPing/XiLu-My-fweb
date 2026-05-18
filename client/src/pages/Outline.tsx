import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Trash2, ChevronRight, ChevronDown, FileText, BookOpen, Edit3, X } from "lucide-react";
import { listProjects, type Project } from "@/api/project";
import { listOutline, createOutlineBeat, updateOutlineBeat, deleteOutlineBeat, applyTemplate, structureTemplates, type OutlineBeat, type BeatType } from "@/api/outline";

const beatTypeLabels: Record<BeatType, string> = { ACT: "幕", SEQUENCE: "序列", SCENE: "场景", BEAT: "节拍" };

const beatTypeColors: Record<BeatType, string> = {
  ACT: "#c8966c", SEQUENCE: "#8b6f47", SCENE: "#6a8caf", BEAT: "#7ba870",
};

function BeatNode({
  beat,
  depth,
  onAdd,
  onEdit,
  onDelete,
  onMove,
}: {
  beat: OutlineBeat;
  depth: number;
  onAdd: (parentId: string | null, sortOrder: number) => void;
  onEdit: (id: string, title: string, description: string | null) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, newParentId: string | null, newOrder: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(beat.title);
  const [editDesc, setEditDesc] = useState(beat.description || "");

  const handleSave = () => {
    if (editTitle.trim()) {
      onEdit(beat.id, editTitle.trim(), editDesc.trim() || null);
    }
    setEditing(false);
  };

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors hover:brightness-95 cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 8}px`, backgroundColor: depth === 0 ? "var(--bg-secondary)" : "transparent" }}
      >
        {/* 展开/折叠 */}
        {beat.children.length > 0 ? (
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 p-0.5">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        {/* 类型标记 */}
        {beat.beatType && (
          <span
            className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: beatTypeColors[beat.beatType] + "22", color: beatTypeColors[beat.beatType] }}
          >
            {beatTypeLabels[beat.beatType]}
          </span>
        )}

        {/* 标题/编辑 */}
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
              className="flex-1 rounded px-2 py-1 text-sm outline-none"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button onClick={handleSave} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>保存</button>
            <button onClick={() => setEditing(false)} className="text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
          </div>
        ) : (
          <>
            <span
              className="flex-1 truncate text-sm"
              style={{ color: "var(--text-primary)", fontWeight: depth === 0 ? 500 : 400 }}
              onClick={() => { setEditTitle(beat.title); setEditDesc(beat.description || ""); setEditing(true); }}
            >
              {beat.title}
            </span>

            {/* 操作按钮 */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => { setEditTitle(beat.title); setEditDesc(beat.description || ""); setEditing(true); }}
                className="p-1 rounded hover:brightness-90"
                title="编辑"
              >
                <Edit3 size={12} style={{ color: "var(--text-secondary)" }} />
              </button>
              <button
                onClick={() => onAdd(beat.id, beat.children.length)}
                className="p-1 rounded hover:brightness-90"
                title="添加子节拍"
              >
                <Plus size={12} style={{ color: "var(--text-secondary)" }} />
              </button>
              <button
                onClick={() => onDelete(beat.id)}
                className="p-1 rounded hover:brightness-90"
                title="删除"
              >
                <Trash2 size={12} style={{ color: "#c1554b" }} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 描述 */}
      {!editing && beat.description && (
        <div className="text-xs truncate" style={{ paddingLeft: `${depth * 20 + 52}px`, color: "var(--text-secondary)", opacity: 0.7, maxWidth: "60%" }}>
          {beat.description}
        </div>
      )}

      {/* 编辑中的描述 */}
      {editing && (
        <div style={{ paddingLeft: `${depth * 20 + 52}px` }} className="mt-1 mb-2">
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="描述..."
            rows={2}
            className="w-full rounded px-2 py-1 text-xs outline-none resize-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </div>
      )}

      {/* 子节点 */}
      {expanded && beat.children.length > 0 && (
        <div>
          {beat.children.map((child) => (
            <BeatNode
              key={child.id}
              beat={child}
              depth={depth + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Outline() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get("project");
  const [beats, setBeats] = useState<OutlineBeat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    listOutline(projectId)
      .then(setBeats)
      .finally(() => setLoading(false));
  }, [projectId]);

  const fetchBeats = () => {
    if (!projectId) return;
    listOutline(projectId).then(setBeats);
  };

  const handleAdd = async (parentId: string | null, sortOrder: number) => {
    if (!projectId) return;
    const title = prompt("节拍标题：");
    if (!title?.trim()) return;
    await createOutlineBeat(projectId, { title: title.trim(), parentId, sortOrder, beatType: parentId ? "BEAT" : "ACT" });
    fetchBeats();
  };

  const handleEdit = async (id: string, title: string, description: string | null) => {
    await updateOutlineBeat(id, { title, description });
    fetchBeats();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个节拍吗？子节拍也会被删除。")) return;
    await deleteOutlineBeat(id);
    fetchBeats();
  };

  const handleApplyTemplate = async (templateName: string) => {
    if (!projectId) return;
    if (!confirm("应用模板会添加新的节拍到现有大纲中，确定继续？")) return;
    await applyTemplate(projectId, templateName);
    setShowTemplate(false);
    fetchBeats();
  };

  // 无作品选择时显示选择器
  if (!projectId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-primary)" }}>
        <BookOpen size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>选择一个作品以查看大纲</p>
        <select
          value=""
          onChange={(e) => setSearchParams({ project: e.target.value })}
          className="rounded-md px-3 py-2 text-sm outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          <option value="" disabled>选择作品...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === projectId);

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部栏 */}
      <div className="flex items-center gap-4 px-8 py-6">
        <div className="flex-1">
          <h1 className="text-2xl font-light" style={{ color: "var(--text-primary)" }}>
            {currentProject?.title || ""} · 大纲
          </h1>
        </div>

        <select
          value={projectId}
          onChange={(e) => setSearchParams({ project: e.target.value })}
          className="rounded-md px-3 py-1.5 text-xs outline-none"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <button
          onClick={() => setShowTemplate(!showTemplate)}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        >
          <FileText size={14} />
          模板
        </button>

        <button
          onClick={() => handleAdd(null, beats.length)}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Plus size={14} />
          添加幕
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {/* 模板面板 */}
        {showTemplate && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {structureTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => handleApplyTemplate(t.name)}
                className="rounded-lg p-4 text-left transition-all hover:scale-[1.01] animate-fade-in"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.label}</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{t.description}</p>
                <p className="mt-2 text-[11px]" style={{ color: "var(--accent)" }}>点击应用此模板</p>
              </button>
            ))}
            <button
              onClick={() => setShowTemplate(false)}
              className="flex items-center justify-center rounded-lg p-4 text-xs transition-all"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <X size={14} className="mr-1" />
              关闭
            </button>
          </div>
        )}

        {/* 大纲树 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : beats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText size={48} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有大纲节拍</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
              点击"添加幕"创建第一个节拍，或使用"模板"快速开始
            </p>
          </div>
        ) : (
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            {beats.map((beat) => (
              <BeatNode
                key={beat.id}
                beat={beat}
                depth={0}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMove={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
