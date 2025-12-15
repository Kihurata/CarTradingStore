// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  is_admin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;  // Từ cookie
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    // ✅ Sửa: Sử dụng fallback secret giống authController để tránh mismatch
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err); // Thêm log để debug nếu cần
    res.status(400).json({ error: 'Invalid token' });
  }
};

export const authenticateTokenOptional = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.user = undefined; // Anonymous: set null-like
    return next(); // Tiếp tục, không block
  }

  try {
    const secret = process.env.JWT_SECRET || "Kz2w!p3#N7tq@h1Yd9uZxFv$e4Rj%T8m^A6sG0b*C5rLkQWnP2oE#V!yH@JxZ";
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.warn("JWT verify failed (optional mode), treating as anonymous:", err);
    req.user = undefined; // Invalid token → treat as anonymous
    next(); // Vẫn tiếp tục
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("requireAdmin check, user:", req.user);
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin required' });
  next();
};

