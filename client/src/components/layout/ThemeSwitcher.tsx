import { useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { useState } from "react";

type ThemeInfo = {
  key: "ink" | "paper" | "night" | "forest";
  label: string;
  color: string;
};

const themes: ThemeInfo[] = [
  { key: "ink", label: "墨", color: "#c8966c" },
  { key: "paper", label: "纸", color: "#8b6f47" },
  { key: "night", label: "夜", color: "#6a8caf" },
  { key: "forest", label: "森", color: "#7ba870" },
];

export function ThemeSwitcher() {
  const current = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-full items-center gap-2 rounded px-2 text-xs hover:brightness-110 transition-colors"
        style={{ color: "var(--text-primary)" }}
      >
        <Palette size={12} />
        <span>主题</span>
        <span className="ml-auto text-[10px]" style={{ color: "var(--text-secondary)" }}>
          {themes.find((t) => t.key === current)?.label}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute left-full bottom-0 z-40 ml-1 rounded-md p-2 shadow-lg animate-fade-in flex gap-1"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); setOpen(false); }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-all",
                  current === t.key ? "ring-2 ring-offset-1" : "hover:scale-110"
                )}
                style={{
                  backgroundColor: t.color,
                  color: "#fff",
                  boxShadow: current === t.key ? `0 0 0 2px var(--surface), 0 0 0 4px ${t.color}` : undefined,
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
  );
}
