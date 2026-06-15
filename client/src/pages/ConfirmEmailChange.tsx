import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmEmailChange } from "@/api/auth";

export function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useState(() => {
    if (!token) {
      setStatus("error");
      setMessage("缺少验证 token");
      return;
    }
    confirmEmailChange(token)
      .then(() => { setStatus("success"); setMessage("邮箱已更新成功"); })
      .catch((err) => { setStatus("error"); setMessage(err.response?.data?.error?.message || "验证失败，链接可能已过期"); });
  });

  return (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm rounded-lg p-8 text-center animate-fade-in" style={{ background: "var(--glass-bg)", backdropFilter: "blur(12px)", border: "1px solid var(--glass-border)" }}>
        <h1 className="mb-2 text-xl font-light" style={{ color: "var(--text-primary)" }}>
          {status === "loading" ? "验证中..." : status === "success" ? "验证成功" : "验证失败"}
        </h1>
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>{message}</p>
        <Link to="/login" className="text-sm" style={{ color: "var(--accent)" }}>前往登录</Link>
      </div>
    </div>
  );
}
