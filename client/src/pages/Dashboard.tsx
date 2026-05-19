import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, BookOpen, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { listProjects, createProject, deleteProject, type Project } from "@/api/project";

const stageLabels: Record<string, string> = {
  PLANNING: "构思中",
  DRAFTING: "写作中",
  REVISING: "修订中",
  COMPLETED: "已完成",
};

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (searchParams.get("create") === "1") {
      setShowCreate(true);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const project = await createProject({ title: newTitle.trim() });
      setShowCreate(false);
      setNewTitle("");
      navigate(`/project/${project.id}`);
    } catch {
      // 静默处理
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个作品吗？此操作不可恢复。")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // 静默处理
    }
    setMenuId(null);
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部 */}
      <div className="flex items-center justify-between px-8 py-6">
        <div>
          <h1 className="text-2xl font-light" style={{ color: "var(--text-primary)" }}>我的作品</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {projects.length > 0 ? `${projects.length} 部作品` : "创建你的第一部作品"}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          <Plus size={16} />
          新建作品
        </button>
      </div>

      {/* 作品列表 */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ color: "var(--text-secondary)" }} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen size={48} style={{ color: "var(--text-secondary)", opacity: 0.4 }} />
            <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>还没有作品</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm font-medium hover:underline"
              style={{ color: "var(--accent)" }}
            >
              创建第一部作品
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group relative cursor-pointer rounded-lg p-5 transition-all hover:scale-[1.02] animate-fade-in"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between">
                  <BookOpen size={20} style={{ color: "var(--accent)" }} />
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuId(menuId === project.id ? null : project.id); }}
                    className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:brightness-90"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>

                <h3 className="mt-3 truncate text-base font-medium" style={{ color: "var(--text-primary)" }}>
                  {project.title}
                </h3>

                {project.subtitle && (
                  <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-secondary)" }}>
                    {project.subtitle}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px]"
                    style={{
                      backgroundColor: project.writingStage === "DRAFTING" ? "rgba(139,111,71,0.15)" : "var(--bg-secondary)",
                      color: project.writingStage === "DRAFTING" ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    {stageLabels[project.writingStage] || project.writingStage}
                  </span>
                  {project.volumeCount !== undefined && (
                    <span>{project.volumeCount} 卷</span>
                  )}
                  {project.characterCount !== undefined && (
                    <span>{project.characterCount} 人物</span>
                  )}
                </div>

                <p className="mt-2 text-[11px]" style={{ color: "var(--text-secondary)", opacity: 0.6 }}>
                  更新于 {new Date(project.updatedAt).toLocaleDateString("zh-CN")}
                </p>

                {/* 右键菜单 */}
                {menuId === project.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuId(null); }} />
                    <div
                      className="absolute right-2 top-10 z-20 w-32 rounded-md py-1 shadow-lg animate-fade-in"
                      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuId(null); navigate(`/project/${project.id}`); }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Edit3 size={12} /> 打开
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110"
                        style={{ color: "#c1554b" }}
                      >
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 创建弹窗 */}
      {showCreate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="w-full max-w-sm rounded-lg p-6 animate-fade-in"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h2 className="text-lg font-light" style={{ color: "var(--text-primary)" }}>新建作品</h2>
              <input
                autoFocus
                type="text"
                placeholder="作品名称"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="mt-4 w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-md px-4 py-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim()}
                  className="rounded-md px-4 py-2 text-xs font-medium transition-opacity"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: creating || !newTitle.trim() ? 0.6 : 1 }}
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
