import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken as generateRandomToken, TOKEN_EXPIRY_MS } from "../../lib/tokens";
import { sendResetEmail, sendEmailChangeEmail } from "../../lib/email";

const prisma = new PrismaClient();
const TOKEN_EXPIRY = "24h";

function getSecret(): string {
  return process.env.JWT_SECRET || "dev-secret";
}

function generateToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, getSecret(), { expiresIn: TOKEN_EXPIRY });
}

function sanitizeUser(user: { id: string; email: string; displayName: string; avatarUrl: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export async function register(input: { email: string; password: string; displayName: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw Object.assign(new Error("该邮箱已被注册"), { statusCode: 409, code: "DUPLICATE_ENTRY" });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.displayName,
    },
  });

  const token = generateToken(user.id, user.email);
  return { user: sanitizeUser(user), token };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw Object.assign(new Error("邮箱或密码错误"), { statusCode: 401, code: "AUTH_REQUIRED" });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("邮箱或密码错误"), { statusCode: 401, code: "AUTH_REQUIRED" });
  }

  const token = generateToken(user.id, user.email);
  return { user: sanitizeUser(user), token };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("用户不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  return { user: sanitizeUser(user) };
}

const frontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

export async function forgotPassword(input: { email: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (user) {
    const token = generateRandomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });
    const link = `${frontendUrl()}/reset-password?token=${token}`;
    await sendResetEmail(user.email, link);
  }
  return { message: "如果该邮箱已注册，重置邮件已发送" };
}

export async function resetPassword(input: { token: string; newPassword: string }) {
  const user = await prisma.user.findFirst({ where: { resetToken: input.token } });
  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    throw Object.assign(new Error("无效或已过期的重置链接"), { statusCode: 400, code: "INVALID_TOKEN" });
  }
  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });
  return { message: "密码已重置成功，请使用新密码登录" };
}

export async function changePassword(userId: string, input: { oldPassword: string; newPassword: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("用户不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  const valid = await bcrypt.compare(input.oldPassword, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("当前密码不正确"), { statusCode: 400, code: "INVALID_PASSWORD" });
  }
  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { message: "密码已修改成功" };
}

export async function requestEmailChange(userId: string, input: { newEmail: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("用户不存在"), { statusCode: 404, code: "NOT_FOUND" });
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("密码不正确"), { statusCode: 400, code: "INVALID_PASSWORD" });
  }
  if (input.newEmail === user.email) {
    throw Object.assign(new Error("新邮箱与当前邮箱相同"), { statusCode: 400, code: "SAME_EMAIL" });
  }
  const existing = await prisma.user.findUnique({ where: { email: input.newEmail } });
  if (existing) {
    throw Object.assign(new Error("该邮箱已被使用"), { statusCode: 409, code: "DUPLICATE_ENTRY" });
  }
  const token = generateRandomToken();
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailChangeToken: token,
      emailChangeTokenExpiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      pendingEmail: input.newEmail,
    },
  });
  const link = `${frontendUrl()}/confirm-email?token=${token}`;
  await sendEmailChangeEmail(input.newEmail, link);
  return { message: "验证邮件已发送至新邮箱，请点击链接确认" };
}

export async function confirmEmailChange(input: { token: string }) {
  const user = await prisma.user.findFirst({ where: { emailChangeToken: input.token } });
  if (!user || !user.emailChangeTokenExpiresAt || user.emailChangeTokenExpiresAt < new Date()) {
    throw Object.assign(new Error("无效或已过期的验证链接"), { statusCode: 400, code: "INVALID_TOKEN" });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.pendingEmail!,
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeTokenExpiresAt: null,
    },
  });
  return { message: "邮箱已更新成功", email: user.pendingEmail! };
}
