import type { Request, Response, NextFunction } from "express";
import {
  registerSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
  changePasswordSchema, changeEmailSchema, confirmEmailChangeSchema,
} from "./auth.schema";
import * as authService from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const result = await authService.getMe(userId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(input);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const input = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(input);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const input = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, input);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}

export async function changeEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).userId;
    const input = changeEmailSchema.parse(req.body);
    const result = await authService.requestEmailChange(userId, input);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}

export async function confirmEmailChange(req: Request, res: Response, next: NextFunction) {
  try {
    const input = confirmEmailChangeSchema.parse(req.body);
    const result = await authService.confirmEmailChange(input);
    res.json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
    }
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "请求参数无效", details: err.errors },
      });
    }
    next(err);
  }
}
