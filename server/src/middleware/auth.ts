import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function getSecret(): string {
  return process.env.JWT_SECRET || "dev-secret";
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_REQUIRED", message: "请先登录" },
    });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, getSecret()) as { sub: string; email: string };
    (req as any).userId = payload.sub;
    (req as any).userEmail = payload.email;
    next();
  } catch (e: any) {
    return res.status(401).json({
      success: false,
      error: { code: "AUTH_EXPIRED", message: "登录已过期，请重新登录" },
    });
  }
}
