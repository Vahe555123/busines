import type { Request, Response } from 'express';
import { User } from '../models/User.js';

export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find()
    .select('-password -verificationCode -verificationCodeExpires')
    .lean();
  res.json(users);
}
