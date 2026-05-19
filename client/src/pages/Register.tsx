import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, displayName);
      navigate("/?create=1");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm rounded-lg p-8 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="mb-2 text-center text-2xl font-light">创建账号</h1>
        <p className="mb-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>开始你的写作之旅</p>

        {error && (
          <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: "rgba(193,85,75,0.15)", color: "#c1554b" }}>
            {error}
          </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="显示名称"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <input
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md py-2 text-sm font-medium transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
          已有账号？<Link to="/login" style={{ color: "var(--accent)" }}>登录</Link>
        </p>
      </div>
    </div>
  );
}
