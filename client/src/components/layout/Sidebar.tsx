import { NavLink, useNavigate } from "react-router-dom";
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
  LogOut,
  Home,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { useState } from "react";

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
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full w-[60px] flex-col items-center border-r py-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
      {/* Logo */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-md text-lg font-bold" style={{ color: "var(--accent)" }}>
        希
      </div>

      {/* 首页 */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors mb-1",
            isActive
              ? "text-[var(--accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )
        }
        title="首页"
      >
        <Home size={20} />
      </NavLink>

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

      {/* 底部：搜索 + 用户 */}
      <div className="flex flex-col items-center gap-1 relative">
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

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          title={user?.displayName || "用户"}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
            {user?.displayName?.charAt(0) || "?"}
          </div>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute bottom-12 left-0 z-20 w-40 rounded-md py-1 shadow-lg animate-fade-in"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="px-3 py-1.5 text-xs border-b" style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
                {user?.displayName}
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate("/"); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110 transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                <Home size={12} />
                工作台
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate("/?create=1"); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110 transition-colors"
                style={{ color: "var(--accent)" }}
              >
                <Plus size={12} />
                新建作品
              </button>
              <ThemeSwitcher />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110 transition-colors"
                style={{ color: "#c1554b" }}
              >
                <LogOut size={12} />
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
