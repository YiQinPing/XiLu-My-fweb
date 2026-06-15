import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { changePassword, requestEmailChange } from "@/api/auth";

export function AccountSettings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Change email
  const [newEmail, setNewEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "新密码至少6位" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwdMsg({ type: "error", text: "两次输入的密码不一致" });
      return;
    }
    setPwdLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPwdMsg({ type: "success", text: "密码已修改成功" });
      setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.response?.data?.error?.message || "修改失败" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMsg(null);
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    try {
      await requestEmailChange(newEmail.trim(), emailPwd);
      setEmailMsg({ type: "success", text: "验证邮件已发送至新邮箱，请点击链接确认（开发环境请查看服务器控制台）" });
      setEmailPwd("");
    } catch (err: any) {
      setEmailMsg({ type: "error", text: err.response?.data?.error?.message || "修改失败" });
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* 顶部 */}
      <div className="flex items-center gap-4 px-8 py-6">
        <h1 className="text-2xl font-light flex-1" style={{ color: "var(--text-primary)" }}>账户设置</h1>
        <button
          onClick={logout}
          className="rounded-md px-4 py-2 text-xs font-medium transition-all hover:brightness-110"
          style={{ backgroundColor: "rgba(193,85,75,0.15)", color: "#c1554b" }}
        >
          退出登录
        </button>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="grid gap-6" style={{ maxWidth: "560px" }}>

          {/* 当前账户信息 */}
          <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
            <h2 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>账户信息</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>用户名</span>
                <span style={{ color: "var(--text-primary)" }}>{user?.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>当前邮箱</span>
                <span style={{ color: "var(--text-primary)" }}>{user?.email}</span>
              </div>
            </div>
          </div>

          {/* 修改密码 */}
          <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
            <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-primary)" }}>修改密码</h2>

            {pwdMsg && (
              <div className="mb-3 rounded-md px-3 py-2 text-xs" style={{
                backgroundColor: pwdMsg.type === "success" ? "rgba(108,192,112,0.15)" : "rgba(193,85,75,0.15)",
                color: pwdMsg.type === "success" ? "#6cc070" : "#c1554b",
              }}>
                {pwdMsg.text}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleChangePassword}>
              <input type="password" placeholder="当前密码" value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)} required
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input type="password" placeholder="新密码（至少6位）" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input type="password" placeholder="确认新密码" value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)} required
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button type="submit" disabled={pwdLoading}
                className="rounded-md px-4 py-2 text-xs font-medium transition-opacity"
                style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: pwdLoading ? 0.7 : 1 }}>
                {pwdLoading ? "保存中..." : "修改密码"}
              </button>
            </form>
          </div>

          {/* 修改邮箱 */}
          <div className="rounded-lg p-5" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
            <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-primary)" }}>修改邮箱</h2>

            {emailMsg && (
              <div className="mb-3 rounded-md px-3 py-2 text-xs" style={{
                backgroundColor: emailMsg.type === "success" ? "rgba(108,192,112,0.15)" : "rgba(193,85,75,0.15)",
                color: emailMsg.type === "success" ? "#6cc070" : "#c1554b",
              }}>
                {emailMsg.text}
              </div>
            )}

            <form className="space-y-3" onSubmit={handleChangeEmail}>
              <input type="email" placeholder={user?.email || "当前邮箱"} value={user?.email || ""} readOnly
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} />
              <input type="email" placeholder="新邮箱" value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)} required
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <input type="password" placeholder="输入当前密码以确认" value={emailPwd}
                onChange={(e) => setEmailPwd(e.target.value)} required
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button type="submit" disabled={emailLoading}
                className="rounded-md px-4 py-2 text-xs font-medium transition-opacity"
                style={{ backgroundColor: "var(--accent)", color: "#fff", opacity: emailLoading ? 0.7 : 1 }}>
                {emailLoading ? "发送中..." : "发送验证邮件"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
