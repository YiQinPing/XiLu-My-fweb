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
  Sparkles,
  Search,
  LogOut,
  Home,
  Plus,
  EyeOff,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
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
  { to: "/ai", icon: Sparkles, label: "AI助手" },
  { to: "/inspiration", icon: Lightbulb, label: "灵感" },
  { to: "/stats", icon: BarChart3, label: "数据" },
];

const activeIconStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.1)",
  boxShadow: "0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const labelClass =
  "absolute top-1/2 -translate-y-1/2 left-[44px] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const focusMode = useAppStore((s) => s.focusMode);
  const toggleFocusMode = useAppStore((s) => s.toggleFocusMode);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="group flex flex-col items-center h-[calc(100%-16px)] m-2 rounded-xl z-20 transition-all duration-300 ease-out overflow-hidden"
      style={{
        width: "var(--sidebar-w, 48px)",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.setProperty("--sidebar-w", "144px");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty("--sidebar-w", "48px");
      }}
    >
      {/* Logo */}
      <NavLink
        to="/"
        className="relative flex h-10 w-full items-center flex-shrink-0 mt-3 mb-2 px-2"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-base font-bold flex-shrink-0"
          style={{ color: "var(--accent)" }}
        >
          希
        </span>
        <span className={labelClass} style={{ color: "var(--text-primary)" }}>
          希陆Flow
        </span>
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-0.5 w-full px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex h-10 w-full items-center rounded-lg transition-all duration-200",
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:brightness-125"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center flex-shrink-0 rounded-lg transition-all duration-200",
                    isActive ? "active-icon" : ""
                  )}
                  style={isActive ? activeIconStyle : undefined}
                >
                  <item.icon size={18} />
                </span>
                <span className={labelClass}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Search + Focus + User */}
      <div className="flex flex-col items-center gap-0.5 w-full px-2 mb-3 mt-2 flex-shrink-0">
        <NavLink
          to="/search"
          className={({ isActive }) =>
            cn(
              "relative flex h-10 w-full items-center rounded-lg transition-all duration-200",
              isActive
                ? "text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:brightness-125"
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center flex-shrink-0 rounded-lg transition-all duration-200",
                  isActive ? "active-icon" : ""
                )}
                style={isActive ? activeIconStyle : undefined}
              >
                <Search size={18} />
              </span>
              <span className={labelClass}>
                搜索
              </span>
            </>
          )}
        </NavLink>

        {/* Focus mode toggle */}
        <button
          onClick={toggleFocusMode}
          className="relative flex h-10 w-full items-center rounded-lg transition-all duration-200 text-[var(--text-secondary)] hover:brightness-125"
        >
          <span
            className="flex h-8 w-8 items-center justify-center flex-shrink-0 rounded-lg transition-all duration-200"
            style={focusMode ? { color: "var(--accent)", ...activeIconStyle } : undefined}
          >
            {focusMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
          <span className={labelClass}>
            {focusMode ? "退出专注" : "专注模式"}
          </span>
        </button>

        {/* User */}
        <div className="relative w-full">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative flex h-10 w-full items-center rounded-lg transition-all duration-200 text-[var(--text-secondary)] hover:brightness-125"
          >
            <span
              className="flex h-8 w-8 items-center justify-center flex-shrink-0 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {user?.displayName?.charAt(0) || "?"}
            </span>
            <span className={labelClass} style={{ color: "var(--text-primary)" }}>
              {user?.displayName || "用户"}
            </span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute bottom-12 left-2 z-20 w-44 rounded-lg py-1 shadow-xl animate-fade-in"
                style={{
                  background: "rgba(30,30,30,0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="px-3 py-1.5 text-xs border-b"
                  style={{
                    color: "var(--text-secondary)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {user?.displayName}
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:brightness-125 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Home size={13} />工作台
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/?create=1");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:brightness-125 transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  <Plus size={13} />新建作品
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/account");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:brightness-125 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Settings size={13} />账户设置
                </button>
                <ThemeSwitcher />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:brightness-125 transition-colors"
                  style={{ color: "#c1554b" }}
                >
                  <LogOut size={13} />退出登录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
