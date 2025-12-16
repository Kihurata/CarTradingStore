// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
export interface JwtPayload {
  id: string;
  email?: string;
  is_admin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Không dùng fallback để tránh sign/verify lệch nhau
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

function readTokenFromRequest(req: Request): string | null {
  // 1) Cookie
  const cookieToken = (req as any).cookies?.jwt;
  if (cookieToken) return cookieToken;

  // 2) Authorization: Bearer <token>
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();

  return null;
}

/**
 * Bắt buộc đăng nhập
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = readTokenFromRequest(req);
  console.log("AUTH cookie jwt (first 30):", token?.slice(0, 30));
  console.log("AUTH secret length:", process.env.JWT_SECRET?.length);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    console.log(
      "AUTH secret sha256:",
      crypto.createHash("sha256").update(getJwtSecret()).digest("hex").slice(0, 12)
    );
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = decoded;
    console.log("AUTH verify OK payload:", decoded);
    return next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Không bắt buộc đăng nhập (guest vẫn vào được)
 * - Nếu không có token: next()
 * - Nếu token sai: next() (coi như guest), KHÔNG throw
 */
export const authenticateTokenOptional = (req: Request, _res: Response, next: NextFunction) => {
  const token = readTokenFromRequest(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.user = decoded;
  } catch (err) {
    // Optional nên không chặn request
    console.warn("JWT optional verify failed:", err);
  }
  return next();
};

/**
 * Bắt buộc là admin
 * NOTE: middleware này phải đặt sau authenticateToken
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Debug nếu cần:
  // console.log("requireAdmin check, user:", req.user);

  if (!req.user?.is_admin) {
    return res.status(403).json({ error: "Admin required" });
  }
  return next();
};
