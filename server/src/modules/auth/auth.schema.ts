import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少6位").max(100),
  displayName: z.string().min(1, "显示名称不能为空").max(50),
});

export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token 不能为空"),
  newPassword: z.string().min(6, "密码至少6位").max(100),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "密码至少6位").max(100),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码确认"),
});

export const confirmEmailChangeSchema = z.object({
  token: z.string().min(1, "Token 不能为空"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ConfirmEmailChangeInput = z.infer<typeof confirmEmailChangeSchema>;
