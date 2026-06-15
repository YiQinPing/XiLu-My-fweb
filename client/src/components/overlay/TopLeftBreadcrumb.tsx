import { useLocation } from "react-router-dom";
import { ProjectSelector } from "@/components/shared/ProjectSelector";
import { useProjectStore } from "@/stores/project";

const pageLabels: Record<string, string> = {
  "/": "工作台",
  "/write": "写作",
  "/outline": "大纲",
  "/world": "世界观",
  "/characters": "人物",
  "/relationships": "关系图",
  "/foreshadowing": "伏笔",
  "/timeline": "时间线",
  "/inspiration": "灵感",
  "/stats": "数据",
  "/search": "搜索",
  "/ai": "AI助手",
};

function getPageLabel(pathname: string): string {
  if (pathname.startsWith("/project/")) return "作品详情";
  return pageLabels[pathname] || "";
}

export function TopLeftBreadcrumb() {
  const location = useLocation();
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProject = useProjectStore((s) => s.setSelectedProject);
  const pageLabel = getPageLabel(location.pathname);

  return (
    <div
      className="animate-slide-down glass-panel glass-rounded absolute top-3 left-[60px] z-30 flex items-center gap-2 px-3 py-1.5"
      style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      <ProjectSelector
        value={selectedProjectId || ""}
        onChange={(id) => setSelectedProject(id)}
        className="bg-transparent border-none text-xs outline-none cursor-pointer"
        style={{ color: "var(--text-primary)", maxWidth: 140 }}
      />
      {pageLabel && (
        <>
          <span style={{ color: "var(--text-secondary)", opacity: 0.4 }}>/</span>
          <span className="text-xs tracking-wide" style={{ color: "var(--text-secondary)" }}>
            {pageLabel}
          </span>
        </>
      )}
    </div>
  );
}
