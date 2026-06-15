import nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export function getSmtpConfigs(): Record<string, SmtpConfig> {
  const configs: Record<string, SmtpConfig> = {};

  if (process.env.SMTP_QQ_USER && process.env.SMTP_QQ_PASS) {
    configs["qq"] = {
      host: process.env.SMTP_QQ_HOST || "smtp.qq.com",
      port: parseInt(process.env.SMTP_QQ_PORT || "587"),
      secure: process.env.SMTP_QQ_SECURE === "true",
      user: process.env.SMTP_QQ_USER,
      pass: process.env.SMTP_QQ_PASS,
    };
  }

  if (process.env.SMTP_163_USER && process.env.SMTP_163_PASS) {
    configs["163"] = {
      host: process.env.SMTP_163_HOST || "smtp.163.com",
      port: parseInt(process.env.SMTP_163_PORT || "465"),
      secure: process.env.SMTP_163_SECURE !== "false",
      user: process.env.SMTP_163_USER,
      pass: process.env.SMTP_163_PASS,
    };
  }

  return configs;
}

const transporters: Record<string, ReturnType<typeof nodemailer.createTransport>> = {};

function getTransporter(from?: string) {
  const configs = getSmtpConfigs();

  // 根据发件地址域名自动选择
  if (from) {
    for (const [key, cfg] of Object.entries(configs)) {
      if (from.includes(`${key}.com`)) {
        if (!transporters[key]) {
          transporters[key] = nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.secure,
            auth: { user: cfg.user, pass: cfg.pass },
          });
        }
        return { transporter: transporters[key], from };
      }
    }
  }

  // 兜底：使用第一个配置的
  const first = Object.entries(configs)[0];
  if (first) {
    const [key, cfg] = first;
    if (!transporters[key]) {
      transporters[key] = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: { user: cfg.user, pass: cfg.pass },
      });
    }
    return { transporter: transporters[key], from: from || cfg.user };
  }

  return null;
}

function emailTemplate(title: string, body: string, link: string, linkText: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <tr><td style="padding:32px 40px 16px;text-align:center;">
    <span style="font-size:18px;font-weight:700;color:#1a1a1a;">希陆Flow</span>
  </td></tr>
  <tr><td style="padding:0 40px 24px;">
    <h2 style="margin:0 0 16px;font-size:16px;font-weight:500;color:#1a1a1a;">${title}</h2>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#666;">${body}</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr><td align="center" style="border-radius:6px;background-color:#4f46e5;">
        <a href="${link}" target="_blank" style="display:inline-block;padding:12px 36px;font-size:14px;color:#fff;text-decoration:none;white-space:nowrap;">${linkText}</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#999;">如果按钮无法点击，请复制以下链接到浏览器打开：</p>
    <p style="margin:8px 0 0;font-size:12px;color:#4f46e5;word-break:break-all;">${link}</p>
    <p style="margin:24px 0 0;font-size:12px;color:#bbb;">此链接 1 小时内有效。如非本人操作，请忽略此邮件。</p>
  </td></tr>
  <tr><td style="padding:16px 40px;border-top:1px solid #eee;text-align:center;">
    <span style="font-size:11px;color:#bbb;">希陆Flow · 小说写作辅助平台</span>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendEmail(options: { to: string; subject: string; html: string }): Promise<void> {
  const result = getTransporter(process.env.SMTP_FROM);

  console.log("\n=== EMAIL ===");
  console.log("To:", options.to);
  console.log("Subject:", options.subject);
  console.log("Body:", options.html);

  if (result) {
    try {
      const info = await result.transporter.sendMail({
        from: result.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log("SMTP sent:", info.messageId);
    } catch (err: any) {
      console.error("SMTP error:", err.message || err);
      console.log("(邮件内容已在上方打印，可手动使用链接)");
    }
  } else {
    console.log("(SMTP 未配置，邮件仅打印到控制台)");
  }
  console.log("=== END EMAIL ===\n");
}

export function sendResetEmail(to: string, link: string): Promise<void> {
  return sendEmail({
    to,
    subject: "希陆Flow - 重置密码",
    html: emailTemplate(
      "重置密码",
      "我们收到了你重置密码的请求。请点击下方按钮设置新密码：",
      link,
      "重置密码"
    ),
  });
}

export function sendEmailChangeEmail(to: string, link: string): Promise<void> {
  return sendEmail({
    to,
    subject: "希陆Flow - 确认邮箱变更",
    html: emailTemplate(
      "确认邮箱变更",
      "你申请将账户邮箱更换为此地址。请点击下方按钮确认变更：",
      link,
      "确认变更"
    ),
  });
}
