import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm rounded-lg p-8 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
        <h1 className="mb-2 text-center text-2xl font-light">希陆Flow</h1>
        <p className="mb-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>登录您的写作空间</p>

        {error && (
          <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: "rgba(193,85,75,0.15)", color: "#c1554b" }}>
            {error}
          </div>
        )}

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md py-2 text-sm font-medium transition-opacity"
            style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs" style={{ color: "var(--text-secondary)" }}>
              忘记密码？
            </Link>
          </div>
        </form>
        <p className="mt-4 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
          还没有账号？<Link to="/register" style={{ color: "var(--accent)" }}>注册</Link>
        </p>
      </div>
    </div>
  );
}
