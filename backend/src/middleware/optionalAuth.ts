import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }
  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    next();
    return;
  }
  const user = await User.findById(payload.userId);
  if (!user || user.status === 'blocked') {
    next();
    return;
  }
  req.user = user;
  next();
}
