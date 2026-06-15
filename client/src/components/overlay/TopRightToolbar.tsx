import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Cloud, User, LogOut, Home, Plus, Palette } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { useAppStore } from "@/stores/app";
import { cn } from "@/lib/utils";

const themes = [
  { key: "ink" as const, label: "墨", color: "#c8966c" },
  { key: "paper" as const, label: "纸", color: "#8b6f47" },
  { key: "night" as const, label: "夜", color: "#6a8caf" },
  { key: "forest" as const, label: "森", color: "#7ba870" },
];

export function TopRightToolbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const currentTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const wordCount = useAppStore((s) => s.currentWordCount);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const isWritePage = location.pathname === "/write";
  const isProjectPage = location.pathname.startsWith("/project/");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="animate-slide-down glass-panel glass-rounded absolute top-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5"
      style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {/* Word count (Write page only) */}
      {isWritePage && wordCount > 0 && (
        <span className="text-xs tracking-wide px-1" style={{ color: "var(--text-secondary)" }}>
          {wordCount.toLocaleString()} 字
        </span>
      )}

      {/* Capsule button */}
      {(isWritePage || isProjectPage) && (
        <button
          className="rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          onClick={() => navigate(isWritePage ? "/" : "/write")}
        >
          {isWritePage ? "工作台" : "写作"}
        </button>
      )}

      {/* Search */}
      <button
        onClick={() => navigate("/search")}
        className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:scale-110"
        style={{ color: "var(--text-secondary)" }}
        title="搜索"
      >
        <Search size={16} />
      </button>

      {/* Theme switcher */}
      <div className="relative">
        <button
          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:scale-110"
          style={{ color: "var(--text-secondary)" }}
          title="主题"
        >
          <Palette size={16} />
        </button>
        {themeMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} />
            <div
              className="absolute right-0 top-full z-50 mt-2 rounded-lg p-2 shadow-lg flex gap-1.5 animate-fade-in"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              {themes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTheme(t.key); setThemeMenuOpen(false); }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-all hover:scale-110",
                    currentTheme === t.key && "ring-2 ring-offset-1"
                  )}
                  style={{
                    backgroundColor: t.color,
                    color: "#fff",
                    boxShadow: currentTheme === t.key ? `0 0 0 2px var(--surface), 0 0 0 4px ${t.color}` : undefined,
                  }}
                  title={t.label}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:scale-110"
          title={user?.displayName || "用户"}
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            {user?.displayName?.charAt(0) || "?"}
          </div>
        </button>
        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            <div
              className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg py-1 shadow-lg animate-fade-in"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="px-3 py-1.5 text-xs border-b"
                style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
              >
                {user?.displayName}
              </div>
              <button
                onClick={() => { setUserMenuOpen(false); navigate("/"); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110 transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                <Home size={12} />工作台
              </button>
              <button
                onClick={() => { setUserMenuOpen(false); navigate("/?create=1"); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110 transition-colors"
                style={{ color: "var(--accent)" }}
              >
                <Plus size={12} />新建作品
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:brightness-110 transition-colors"
                style={{ color: "#c1554b" }}
              >
                <LogOut size={12} />退出登录
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cloud sync (placeholder) */}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md transition-all cursor-not-allowed"
        style={{ color: "var(--text-secondary)", opacity: 0.3 }}
        title="云同步 - 即将上线"
      >
        <Cloud size={16} />
      </button>
    </div>
  );
}
