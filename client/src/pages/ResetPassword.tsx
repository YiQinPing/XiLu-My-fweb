import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/api/auth";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="w-full max-w-sm rounded-lg p-8 text-center animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
          <h1 className="mb-2 text-xl font-light" style={{ color: "var(--text-primary)" }}>无效的重置链接</h1>
          <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>缺少 token 参数，请重新申请重置密码。</p>
          <Link to="/forgot-password" style={{ color: "var(--accent)" }} className="text-sm">重新申请</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "重置密码失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm rounded-lg p-8 animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
        <h1 className="mb-2 text-center text-2xl font-light" style={{ color: "var(--text-primary)" }}>重置密码</h1>

        {done ? (
          <div className="text-center">
            <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>密码已重置成功，请使用新密码登录。</p>
            <Link to="/login" className="text-sm" style={{ color: "var(--accent)" }}>前往登录</Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-md px-3 py-2 text-sm" style={{ backgroundColor: "rgba(193,85,75,0.15)", color: "#c1554b" }}>
                {error}
              </div>
            )}

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="新密码（至少6位）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-md px-3 py-2 pr-10 text-sm outline-none"
                  style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="确认新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(!showPassword)} />
                显示密码
              </label>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md py-2 text-sm font-medium transition-opacity"
                style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "重置中..." : "重置密码"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
