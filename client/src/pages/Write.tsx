import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, ChevronRight, ChevronDown, BookOpen, FileText, Download, X, Edit3 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { getChapter, updateChapter, createChapter, deleteChapter, type ChapterDetail } from "@/api/chapter";
import { listVolumes, createVolume, updateVolume, deleteVolume, type Volume } from "@/api/volume";
import { useProjectStore } from "@/stores/project";
import { useAppStore } from "@/stores/app";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import { EmptyState } from "@/components/overlay/EmptyState";

function countWords(text: string): number {
  const cn = text.replace(/[\x00-\xff]/g, "");
  const en = text.replace(/[^\x00-\xff]/g, " ").trim();
  const enWords = en ? en.split(/\s+/).length : 0;
  return cn.length + enWords;
}

/* ---- 确认弹窗 ---- */
function ConfirmModal({
  open, title, message, onConfirm, onCancel,
}: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-full max-w-xs rounded-lg p-5 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
          <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onCancel} className="rounded-md px-3 py-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
            <button onClick={onConfirm} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: "#c1554b", color: "#fff" }}>确定删除</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---- 新建章节弹窗 ---- */
function NewChapterModal({
  open, volumes, onConfirm, onCancel, presetVolumeId,
}: {
  open: boolean; volumes: Volume[];
  onConfirm: (volumeId: string, title: string, chapterNumber: string) => void; onCancel: () => void;
  presetVolumeId?: string;
}) {
  const [title, setTitle] = useState("");
  const [num, setNum] = useState("");
  const [volId, setVolId] = useState(volumes[0]?.id || "");

  useEffect(() => { if (open) { setTitle(""); setNum(""); setVolId(presetVolumeId || volumes[0]?.id || ""); } }, [open, volumes, presetVolumeId]);

  if (!open) return null;

  const submit = () => {
    if (!title.trim() || !num.trim() || !volId) return;
    onConfirm(volId, title.trim(), num.trim());
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-full max-w-xs rounded-lg p-5 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
          <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>新建章节</h3>
          <div className="mt-3 space-y-3">
            {volumes.length > 1 && (
              <select value={volId} onChange={(e) => setVolId(e.target.value)}
                className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {volumes.map((v) => <option key={v.id} value={v.id}>第{v.sequenceNum}卷 · {v.title}</option>)}
              </select>
            )}
            <input autoFocus placeholder="章节标题" value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <input placeholder="章节编号（如 1、2.1）" value={num} onChange={(e) => setNum(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full rounded-md px-2 py-1.5 text-xs outline-none"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onCancel} className="rounded-md px-3 py-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
            <button onClick={submit} disabled={!title.trim() || !num.trim()}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-opacity"
              style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: title.trim() && num.trim() ? 1 : 0.6 }}>创建</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function Write() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterId = searchParams.get("chapter");
  const navigate = useNavigate();
  const globalProjectId = useProjectStore((s) => s.selectedProjectId);
  const projectId = globalProjectId || searchParams.get("project") || "";
  const setGlobalProject = useProjectStore((s) => s.setSelectedProject);
  const setCurrentWordCount = useAppStore((s) => s.setCurrentWordCount);

  // Chapter editor state
  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(!!chapterId);
  const [wordCount, setWordCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Directory tree state
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set());
  const [showVolumeCreate, setShowVolumeCreate] = useState(false);
  const [volumeTitle, setVolumeTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showTree, setShowTree] = useState(false);

  // Volume rename state
  const [renameVolumeId, setRenameVolumeId] = useState<string | null>(null);
  const [renameVolumeTitle, setRenameVolumeTitle] = useState("");
  const [renamingVolume, setRenamingVolume] = useState(false);

  // Chapter title inline edit
  const [editingChapterTitle, setEditingChapterTitle] = useState(false);
  const [editChapterTitleValue, setEditChapterTitleValue] = useState("");

  // Modal state
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterPresetVolumeId, setNewChapterPresetVolumeId] = useState<string | undefined>(undefined);
  const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "开始书写你的故事..." }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap-editor outline-none max-w-3xl mx-auto py-12 px-6",
        style: "min-height: 60vh; font-size: 1.05rem; line-height: 2;",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      const wc = countWords(text);
      setWordCount(wc);
      setCurrentWordCount(wc);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => handleAutoSave(ed.getHTML()), 2000);
    },
  });

  const loadVolumes = useCallback(async () => {
    if (!projectId) return;
    try { const vols = await listVolumes(projectId); setVolumes(vols); } catch { setVolumes([]); }
  }, [projectId]);

  useEffect(() => { loadVolumes(); }, [loadVolumes]);

  useEffect(() => {
    if (!chapterId) { setLoading(false); return; }
    setLoading(true);
    getChapter(chapterId)
      .then((ch) => { setChapter(ch); if (editor && ch.content) editor.commands.setContent(ch.content); })
      .finally(() => setLoading(false));
  }, [chapterId]);

  useEffect(() => {
    if (editor && chapter?.content) {
      editor.commands.setContent(chapter.content);
      setWordCount(countWords(editor.getText()));
    }
  }, [editor, chapter]);

  const handleAutoSave = useCallback(async (html: string) => {
    if (!chapterId) return;
    setSaving(true);
    try {
      const newCount = countWords(editor?.getText() ?? "");
      await updateChapter(chapterId, { content: html, actualWordCount: newCount, status: "DRAFTING" });
      setLastSaved(new Date());
    } catch { /* ignore */ }
    finally { setSaving(false); }
  }, [chapterId, editor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (editor) handleAutoSave(editor.getHTML()); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor, handleAutoSave]);

  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  const handleExport = () => {
    if (!chapter || !editor) return;
    const text = editor.getText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${chapter.chapterNumber}-${chapter.title}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateVolume = async () => {
    if (!volumeTitle.trim() || !projectId) return;
    setCreating(true);
    try {
      await createVolume(projectId, { title: volumeTitle.trim(), sequenceNum: volumes.length + 1 });
      setShowVolumeCreate(false);
      setVolumeTitle("");
      loadVolumes();
    } finally { setCreating(false); }
  };

  const handleDeleteVolume = (volumeId: string) => {
    setConfirm({
      title: "删除卷",
      message: "确定删除这个卷吗？卷内所有章节也会被删除。",
      onConfirm: async () => { await deleteVolume(volumeId); setConfirm(null); loadVolumes(); },
    });
  };

  const handleRenameVolume = async () => {
    if (!renameVolumeId || !renameVolumeTitle.trim()) return;
    setRenamingVolume(true);
    try {
      await updateVolume(renameVolumeId, { title: renameVolumeTitle.trim() } as Partial<Volume>);
      setVolumes((prev) => prev.map((v) => (v.id === renameVolumeId ? { ...v, title: renameVolumeTitle.trim() } : v)));
      setRenameVolumeId(null);
    } catch { /* ignore */ }
    finally { setRenamingVolume(false); }
  };

  const handleChapterTitleEdit = async () => {
    if (!chapterId || !editChapterTitleValue.trim()) {
      setEditingChapterTitle(false);
      return;
    }
    try {
      await updateChapter(chapterId, { title: editChapterTitleValue.trim() });
      setChapter((prev) => prev ? { ...prev, title: editChapterTitleValue.trim() } : null);
    } catch { /* ignore */ }
    setEditingChapterTitle(false);
  };

  const handleCreateChapter = async (volumeId: string, title: string, chapterNumber: string) => {
    const vols = volumes.find((v) => v.id === volumeId);
    await createChapter(volumeId, { title, chapterNumber, sortOrder: (vols?.chapters?.length || 0) + 1 });
    loadVolumes();
  };

  const handleQuickAddChapter = (volumeId: string) => {
    setNewChapterPresetVolumeId(volumeId);
    setShowNewChapter(true);
  };

  const handleDeleteChapter = (chId: string) => {
    setConfirm({
      title: "删除章节",
      message: "确定删除这个章节吗？",
      onConfirm: async () => {
        await deleteChapter(chId);
        if (chapterId === chId) { setChapter(null); setSearchParams({ project: projectId }); }
        setConfirm(null);
        loadVolumes();
      },
    });
  };

  const selectChapter = (ch: { id: string }) => {
    setSearchParams({ project: projectId, chapter: ch.id });
    setShowTree(false);
  };

  const toggleVolume = (id: string) => {
    setExpandedVolumes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      {/* 顶部信息条 */}
      <div className="glass-panel flex items-center gap-3 px-4 py-2 rounded-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <ProjectSelector value={projectId}
            onChange={(id) => { setGlobalProject(id); setSearchParams({ project: id }); }}
            className="w-36 rounded-md px-2 py-1 text-xs outline-none bg-transparent"
            style={{ border: "1px solid var(--glass-border)", color: "var(--text-primary)" }} />
          <button
            onClick={() => setShowTree(!showTree)}
            className="rounded-md px-2 py-1 text-xs transition-all"
            style={{
              border: "1px solid var(--glass-border)",
              color: showTree ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor: showTree ? "rgba(255,255,255,0.06)" : "transparent",
            }}
          >目录</button>
        </div>

        {chapter ? (
          <>
            <div className="flex-1 min-w-0">
              {editingChapterTitle ? (
                <input autoFocus type="text" value={editChapterTitleValue}
                  onChange={(e) => setEditChapterTitleValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleChapterTitleEdit();
                    if (e.key === "Escape") setEditingChapterTitle(false);
                  }}
                  onBlur={handleChapterTitleEdit}
                  className="text-sm font-medium w-full outline-none rounded px-1.5 py-0.5"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--accent)", color: "var(--text-primary)" }}
                />
              ) : (
                <h2 className="text-sm font-medium cursor-pointer hover:brightness-110 truncate"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => { setEditingChapterTitle(true); setEditChapterTitleValue(chapter.title); }}
                  title="点击编辑标题">
                  {chapter.chapterNumber} · {chapter.title}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
              <span>{wordCount.toLocaleString()} 字</span>
              {saving ? <span style={{ color: "var(--accent)" }}>保存中...</span>
               : lastSaved ? <span>已保存 {lastSaved.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
               : null}
              <span className="rounded px-2 py-0.5" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>Ctrl+S 保存</span>
              <button onClick={handleExport}
                className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                <Download size={13} />导出
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {projectId ? "选择一个章节开始写作" : "请先选择一个作品"}
          </div>
        )}
      </div>

      {/* 目录树下拉面板 */}
      {showTree && (
        <div className="glass-panel flex flex-col rounded-lg overflow-hidden flex-shrink-0 animate-slide-down">
          {/* 标题栏：目录 + 新建章 + 关闭 */}
          <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>目录</span>
            <div className="flex-1" />
            {volumes.length > 0 && (
              <button onClick={() => setShowNewChapter(true)}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition-all hover:brightness-110"
                style={{ color: "var(--accent)" }}>
                <Plus size={12} />新建章
              </button>
            )}
            <button onClick={() => setShowTree(false)} className="p-0.5 rounded hover:brightness-110" style={{ color: "var(--text-secondary)" }}>
              <X size={14} />
            </button>
          </div>

          {/* 卷+章节列表 */}
          <div className="overflow-auto" style={{ maxHeight: "160px" }}>
            {volumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 px-4">
                <BookOpen size={24} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
                <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>还没有卷，点击下方按钮创建</p>
              </div>
            ) : (
              volumes.map((vol) => {
                const isExpanded = expandedVolumes.has(vol.id);
                const chapters = vol.chapters || [];
                return (
                  <div key={vol.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-1 px-3 py-1.5 hover:brightness-110 group">
                      <button onClick={() => toggleVolume(vol.id)} className="p-0.5 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>
                      <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)", maxWidth: "140px" }}>
                        第{vol.sequenceNum}卷 · {vol.title}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); handleQuickAddChapter(vol.id); }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 flex-shrink-0" title="新建章节" style={{ color: "var(--accent)" }}>
                        <Plus size={11} />
                      </button>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                        {chapters.length}章
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setRenameVolumeId(vol.id); setRenameVolumeTitle(vol.title); }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 flex-shrink-0" title="重命名" style={{ color: "var(--text-secondary)" }}>
                        <Edit3 size={11} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteVolume(vol.id); }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "#c1554b" }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                    {isExpanded && (
                      <div>
                        {chapters.map((ch) => (
                          <button key={ch.id} onClick={() => selectChapter(ch)}
                            className="flex items-center gap-1.5 pl-8 pr-3 py-1 text-left transition-colors hover:brightness-110 group"
                          >
                            <FileText size={11} style={{ color: chapterId === ch.id ? "var(--accent)" : "var(--text-secondary)" }} />
                            <span className="text-xs truncate" style={{ color: chapterId === ch.id ? "var(--accent)" : "var(--text-primary)", maxWidth: "130px" }}>
                              {ch.chapterNumber} · {ch.title}
                            </span>
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                              {ch.actualWordCount.toLocaleString()}字
                            </span>
                            <span onClick={(e) => { e.stopPropagation(); handleDeleteChapter(ch.id); }}
                              className="p-0.5 rounded opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: "#c1554b" }}>
                              <Trash2 size={10} />
                            </span>
                          </button>
                        ))}
                        {chapters.length === 0 && (
                          <p className="pl-8 pr-3 py-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>暂无章节</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 底部：新建卷 */}
          <div className="p-2" style={{ borderTop: "1px solid var(--glass-border)" }}>
            <button onClick={() => setShowVolumeCreate(true)}
              className="flex w-full items-center justify-center gap-1 rounded-md py-1 text-xs font-medium transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
              <Plus size={13} />新建卷
            </button>
          </div>
        </div>
      )}

      {/* 编辑器 */}
      <div className="flex-1 overflow-auto rounded-lg" style={{ background: "rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : chapterId && chapter ? (
          <EditorContent editor={editor} />
        ) : (
          <EmptyState
            title="新章未启，落笔有神"
            description={!projectId ? "请先选择一个作品" : "从目录中选择或创建章节开始写作"}
            actionLabel={!projectId ? "创建第一部作品" : "创建第一章"}
            onAction={() => {
              if (!projectId) { navigate("/?create=1"); }
              else { setShowNewChapter(true); }
            }}
          />
        )}
      </div>

      {/* 新建卷弹窗 */}
      {showVolumeCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowVolumeCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-lg p-6 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
              <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>新建卷</h2>
              <input autoFocus type="text" placeholder="卷名（如：第一卷 启程）" value={volumeTitle}
                onChange={(e) => setVolumeTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateVolume()}
                className="mt-4 w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowVolumeCreate(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleCreateVolume} disabled={creating || !volumeTitle.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium transition-opacity"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: creating || !volumeTitle.trim() ? 0.6 : 1 }}>
                  {creating ? "创建中..." : "创建"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 重命名卷弹窗 */}
      {renameVolumeId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setRenameVolumeId(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-lg p-6 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
              <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>重命名卷</h2>
              <input autoFocus type="text" placeholder="卷名" value={renameVolumeTitle}
                onChange={(e) => setRenameVolumeTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameVolume()}
                className="mt-4 w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setRenameVolumeId(null)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button onClick={handleRenameVolume} disabled={renamingVolume || !renameVolumeTitle.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium transition-opacity"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: renamingVolume || !renameVolumeTitle.trim() ? 0.6 : 1 }}>
                  {renamingVolume ? "保存中..." : "保存"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 新建章节弹窗 */}
      <NewChapterModal open={showNewChapter} volumes={volumes} presetVolumeId={newChapterPresetVolumeId}
        onConfirm={(volId, title, num) => { handleCreateChapter(volId, title, num); setShowNewChapter(false); setNewChapterPresetVolumeId(undefined); }}
        onCancel={() => { setShowNewChapter(false); setNewChapterPresetVolumeId(undefined); }} />

      {/* 确认弹窗 */}
      <ConfirmModal open={!!confirm} title={confirm?.title || ""} message={confirm?.message || ""}
        onConfirm={() => confirm?.onConfirm()}
        onCancel={() => setConfirm(null)} />
    </div>
  );
}
