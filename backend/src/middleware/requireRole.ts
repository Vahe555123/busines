import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import type { UserRole } from '../models/User.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      throw new AppError('Требуется авторизация', 401);
    }
    if (!allowedRoles.includes(user.role as UserRole)) {
      throw new AppError('Недостаточно прав', 403);
    }
    next();
  };
}
