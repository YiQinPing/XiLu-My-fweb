import { NavLink } from "react-router-dom";
import {
  BookOpen,
  GitBranch,
  Globe,
  Users,
  GitGraph,
  Eye,
  Clock,
  Lightbulb,
  BarChart3,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/write", icon: BookOpen, label: "写作" },
  { to: "/outline", icon: GitBranch, label: "大纲" },
  { to: "/world", icon: Globe, label: "世界观" },
  { to: "/characters", icon: Users, label: "人物" },
  { to: "/relationships", icon: GitGraph, label: "关系图" },
  { to: "/foreshadowing", icon: Eye, label: "伏笔" },
  { to: "/timeline", icon: Clock, label: "时间线" },
  { to: "/inspiration", icon: Lightbulb, label: "灵感" },
  { to: "/stats", icon: BarChart3, label: "数据" },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-[60px] flex-col items-center border-r py-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
      {/* Logo */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-md text-lg font-bold" style={{ color: "var(--accent)" }}>
        希
      </div>

      {/* 导航 */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                isActive
                  ? "text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )
            }
            title={item.label}
          >
            <item.icon size={20} />
          </NavLink>
        ))}
      </nav>

      {/* 底部搜索 */}
      <NavLink
        to="/search"
        className={({ isActive }) =>
          cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            isActive
              ? "text-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )
        }
        title="搜索"
      >
        <Search size={20} />
      </NavLink>
    </aside>
  );
}
