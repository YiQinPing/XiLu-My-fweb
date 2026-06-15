import { Eye, EyeOff, Target } from "lucide-react";
import { useAppStore } from "@/stores/app";
import { cn } from "@/lib/utils";

export function BottomLeftCapsuleBar() {
  const focusMode = useAppStore((s) => s.focusMode);
  const toggleFocusMode = useAppStore((s) => s.toggleFocusMode);
  const writingGoal = useAppStore((s) => s.writingGoal);
  const currentWordCount = useAppStore((s) => s.currentWordCount);

  return (
    <div
      className="animate-slide-up-fade glass-capsule absolute bottom-3 left-[60px] z-30 flex items-center gap-1 px-2 py-1.5"
      style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {/* 专注模式 */}
      <button
        onClick={toggleFocusMode}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide transition-all",
          focusMode
            ? "text-white"
            : "glass-capsule-hover"
        )}
        style={focusMode ? { backgroundColor: "var(--accent)" } : { color: "var(--text-secondary)" }}
        title={focusMode ? "退出专注模式" : "专注模式"}
      >
        {focusMode ? <EyeOff size={14} /> : <Eye size={14} />}
        <span>{focusMode ? "专注中" : "专注"}</span>
      </button>

      {/* 写作目标 */}
      <div
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs tracking-wide"
        style={{ color: "var(--text-secondary)" }}
        title="今日写作目标"
      >
        <Target size={14} />
        <span>
          {currentWordCount.toLocaleString()} / {writingGoal.toLocaleString()} 字
        </span>
      </div>
    </div>
  );
}
