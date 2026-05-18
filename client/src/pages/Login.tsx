export function Login() {
  return (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="w-full max-w-sm rounded-lg p-8 animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
        <h1 className="mb-2 text-center text-2xl font-light">希陆Flow</h1>
        <p className="mb-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>登录您的写作空间</p>
        <form className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="邮箱"
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <input
            type="password"
            placeholder="密码"
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <button
            type="submit"
            className="rounded-md py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            登录
          </button>
        </form>
        <p className="mt-4 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
          还没有账号？<a href="/register" style={{ color: "var(--accent)" }}>注册</a>
        </p>
      </div>
    </div>
  );
}
