import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/stores/app";

const CIRCLE_R = 26;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

export function BottomRightWidget() {
  const navigate = useNavigate();
  const writingGoal = useAppStore((s) => s.writingGoal);
  const currentWordCount = useAppStore((s) => s.currentWordCount);
  const [hovered, setHovered] = useState(false);

  const progress = writingGoal > 0 ? Math.min(currentWordCount / writingGoal, 1) : 0;
  const dashOffset = CIRCLE_C * (1 - progress);

  return (
    <div
      className="animate-slide-up-fade absolute bottom-3 right-3 z-30"
      style={{ transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex items-center gap-2">
        {/* Label on hover */}
        <div
          className="transition-all duration-300 overflow-hidden"
          style={{
            opacity: hovered ? 1 : 0,
            maxWidth: hovered ? 120 : 0,
          }}
        >
          <div className="glass-capsule px-3 py-1.5 text-xs tracking-wide whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
            AI助手
            {writingGoal > 0 && (
              <span className="ml-1" style={{ color: "var(--accent)" }}>
                {Math.round(progress * 100)}%
              </span>
            )}
          </div>
        </div>

        {/* Circular button + progress ring */}
        <button
          onClick={() => navigate("/ai")}
          className="relative flex h-14 w-14 items-center justify-center rounded-full transition-all hover:scale-110"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border)",
          }}
          title="AI助手"
        >
          {/* SVG progress ring */}
          {writingGoal > 0 && currentWordCount > 0 && (
            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 64 64"
            >
              <circle
                cx="32"
                cy="32"
                r={CIRCLE_R}
                fill="none"
                stroke="var(--border)"
                strokeWidth="2.5"
              />
              <circle
                cx="32"
                cy="32"
                r={CIRCLE_R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={CIRCLE_C}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
              />
            </svg>
          )}
          <Sparkles size={22} style={{ color: "var(--accent)" }} />
        </button>
      </div>
    </div>
  );
}
