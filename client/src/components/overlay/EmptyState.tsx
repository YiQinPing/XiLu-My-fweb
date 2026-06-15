import { PenLine, type LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon: Icon = PenLine,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <Icon
        size={56}
        className="animate-pulse-soft"
        style={{ color: "var(--text-secondary)", opacity: 0.35 }}
      />
      <p
        className="text-sm tracking-wider"
        style={{ color: "var(--text-secondary)", opacity: 0.7 }}
      >
        {title}
      </p>
      {description && (
        <p className="text-xs" style={{ color: "var(--text-secondary)", opacity: 0.5 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 animate-breathe rounded-lg px-6 py-2.5 text-sm font-medium tracking-wide transition-all hover:scale-105"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
