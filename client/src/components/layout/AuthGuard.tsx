import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="animate-pulse-soft text-sm" style={{ color: "var(--text-secondary)" }}>
          加载中...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
