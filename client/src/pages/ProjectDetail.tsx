import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ChevronRight, BookOpen, FileText } from "lucide-react";
import { getProject, deleteProject, type ProjectDetail } from "@/api/project";
import { createVolume, deleteVolume } from "@/api/volume";
import { createChapter } from "@/api/chapter";

const stageLabels: Record<string, string> = {
  PLANNING: "构思中",
  DRAFTING: "写作中",
  REVISING: "修订中",
  COMPLETED: "已完成",
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVolumeCreate, setShowVolumeCreate] = useState(false);
  const [volumeTitle, setVolumeTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProject = () => {
    if (!id) return;
    getProject(id)
      .then(setProject)
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleCreateVolume = async () => {
    if (!volumeTitle.trim() || !id) return;
    setCreating(true);
    try {
      await createVolume(id, {
        title: volumeTitle.trim(),
        sequenceNum: (project?.volumes.length ?? 0) + 1,
      });
      setShowVolumeCreate(false);
      setVolumeTitle("");
      fetchProject();
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteVolume = async (volumeId: string) => {
    if (!confirm("确定删除这个卷吗？卷内所有章节也会被删除。")) return;
    await deleteVolume(volumeId);
    fetchProject();
  };

  const handleCreateChapter = async (volumeId: string, chaptersCount: number) => {
    const title = prompt("章节标题：");
    if (!title?.trim()) return;
    const num = prompt("章节编号（如 1、2.1）：");
    if (!num?.trim()) return;
    await createChapter(volumeId, {
      title: title.trim(),
      chapterNumber: num.trim(),
      sortOrder: chaptersCount + 1,
    });
    fetchProject();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  if (!project) return null;

  const totalWords = project.volumes.reduce((sum, v) => sum + v.actualWordCount, 0);
  const totalChapters = project.volumes.reduce((s, v) => s + v.chapters.length, 0);

  const handleDeleteProject = async () => {
    if (!confirm("确定删除这个作品吗？此操作不可恢复。")) return;
    await deleteProject(project.id);
    navigate("/");
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部栏 */}
      <div className="flex items-center gap-4 px-8 py-6">
        <button
          onClick={() => navigate("/")}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:brightness-90"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-light" style={{ color: "var(--text-primary)" }}>{project.title}</h1>
          {project.subtitle && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{project.subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: "var(--bg-secondary)" }}>
            {stageLabels[project.writingStage] || project.writingStage}
          </span>
          <span>{totalWords.toLocaleString()} 字</span>
          <button
            onClick={handleDeleteProject}
            className="flex items-center gap-1 rounded px-2 py-1 transition-colors hover:brightness-90"
            style={{ color: "#c1554b" }}
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {/* 统计卡片 */}
        <div className="mb-8 grid grid-cols-4 gap-4">
          {[
            { label: "卷", value: project.volumes.length },
            { label: "章节", value: totalChapters },
            { label: "人物", value: (project as any).characterCount ?? 0 },
            { label: "地点", value: (project as any).locationCount ?? 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="text-2xl font-medium" style={{ color: "var(--accent)" }}>{stat.value}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 卷与章节 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>卷与章节</h2>
          <button
            onClick={() => setShowVolumeCreate(true)}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            <Plus size={14} />
            新建卷
          </button>
        </div>

        {project.volumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg py-16" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <BookOpen size={40} style={{ color: "var(--text-secondary)", opacity: 0.3 }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>还没有卷，点击上方按钮创建</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {project.volumes.map((volume) => (
              <div
                key={volume.id}
                className="rounded-lg overflow-hidden animate-fade-in"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-3 px-5 py-3">
                  <ChevronRight size={14} style={{ color: "var(--text-secondary)" }} />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      第{volume.sequenceNum}卷 · {volume.title}
                    </h3>
                    {volume.subtitle && (
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{volume.subtitle}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCreateChapter(volume.id, volume.chapters.length)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:brightness-90"
                    style={{ color: "var(--accent)" }}
                  >
                    <FileText size={12} />
                    新建章
                  </button>
                  <button
                    onClick={() => handleDeleteVolume(volume.id)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:brightness-90"
                    style={{ color: "#c1554b" }}
                  >
                    <Trash2 size={12} />
                  </button>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {volume.chapters.length} 章 · {volume.actualWordCount.toLocaleString()} 字
                  </span>
                </div>

                {volume.chapters.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {volume.chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => navigate(`/write?chapter=${ch.id}`)}
                        className="flex w-full items-center gap-4 px-5 py-2 text-left transition-colors hover:brightness-95"
                        style={{ backgroundColor: "var(--bg-primary)" }}
                      >
                        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                          {ch.chapterNumber}
                        </span>
                        <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>{ch.title}</span>
                        <span className="text-[11px] rounded-full px-2 py-0.5" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                          {ch.actualWordCount.toLocaleString()} 字
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新建卷弹窗 */}
      {showVolumeCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowVolumeCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-lg p-6 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
              <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>新建卷</h2>
              <input
                autoFocus
                type="text"
                placeholder="卷名（如：第一卷 启程）"
                value={volumeTitle}
                onChange={(e) => setVolumeTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateVolume()}
                className="mt-4 w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowVolumeCreate(false)} className="rounded-md px-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>取消</button>
                <button
                  onClick={handleCreateVolume}
                  disabled={creating || !volumeTitle.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium transition-opacity"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: creating || !volumeTitle.trim() ? 0.6 : 1 }}
                >
                  {creating ? "创建中..." : "创建"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
