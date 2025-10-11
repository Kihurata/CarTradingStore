// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export interface AuthRequest extends Request {
  user?: any;
}
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

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth Header:', authHeader);
  console.log('Token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || process.env.SECRET;
    if (!secret) {
      console.error('JWT secret not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret) as any;
    console.log('Decoded token:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.is_admin) return res.status(403).json({ error: 'Admin required' });
  next();
};