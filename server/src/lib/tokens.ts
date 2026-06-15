import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
