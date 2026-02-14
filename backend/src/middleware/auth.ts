import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Требуется авторизация', 401);
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError('Недействительный или истёкший токен', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError('Пользователь не найден', 401);
  }
  if (user.status === 'blocked') {
    throw new AppError('Аккаунт заблокирован', 403);
  }

  req.user = user;
  next();
}
