import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "@/api/auth";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true); // 即使出错也显示成功（防邮箱枚举）
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm rounded-lg p-8 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
        <h1 className="mb-2 text-center text-2xl font-light" style={{ color: "var(--text-primary)" }}>找回密码</h1>
        <p className="mb-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          {sent ? "邮件已发送" : "输入注册邮箱，我们将发送重置链接"}
        </p>

        {sent ? (
          <div className="text-center">
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              如果该邮箱已注册，重置邮件已发送，请检查收件箱。
              <br />
              <span className="text-xs" style={{ opacity: 0.6 }}>（开发环境请查看服务器控制台获取重置链接）</span>
            </p>
            <Link to="/login" className="mt-4 inline-block text-sm" style={{ color: "var(--accent)" }}>
              返回登录
            </Link>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="rounded-md px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md py-2 text-sm font-medium transition-opacity"
              style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "发送中..." : "发送重置邮件"}
            </button>
            <p className="text-center text-xs" style={{ color: "var(--text-secondary)" }}>
              <Link to="/login" style={{ color: "var(--accent)" }}>返回登录</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
