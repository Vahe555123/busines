import type { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Purchase } from '../models/Purchase.js';
import { AppError } from '../utils/AppError.js';
import type { UserRole, UserStatus } from '../models/User.js';

function toSafeUser(user: {
  _id: unknown;
  email: string;
  name?: string;
  role?: string;
  status?: string;
  isVerified: boolean;
  createdAt: Date;
}) {
  const u = user as { _id: { toString(): string }; status?: string };
  return {
    id: u._id?.toString?.(),
    email: user.email,
    name: user.name,
    role: (user.role as UserRole) ?? 'client',
    status: (u.status as UserStatus) ?? 'active',
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find()
    .select('-password -verificationCode -verificationCodeExpires')
    .sort({ createdAt: -1 })
    .lean();

  const purchaseCounts = await Purchase.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(
    purchaseCounts.map((p) => [p._id.toString(), p.count])
  );

  const list = users.map((u) => ({
    ...toSafeUser(u as Parameters<typeof toSafeUser>[0]),
    purchaseCount: countMap.get((u as { _id: { toString(): string } })._id.toString()) ?? 0,
  }));
  res.json(list);
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id).select('-password -verificationCode -verificationCodeExpires');
  if (!user) throw new AppError('Пользователь не найден', 404);
  const purchases = await Purchase.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  res.json({
    user: toSafeUser(user as Parameters<typeof toSafeUser>[0]),
    purchases,
  });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('Пользователь не найден', 404);

  const { name, role, status } = req.body as { name?: string; role?: UserRole; status?: UserStatus };
  if (name !== undefined) user.name = name.trim();
  if (role !== undefined && ['client', 'manager', 'admin'].includes(role)) user.role = role;
  if (status !== undefined && ['active', 'blocked'].includes(status)) user.status = status;
  await user.save();

  res.json(toSafeUser(user as Parameters<typeof toSafeUser>[0]));
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('Пользователь не найден', 404);
  await Purchase.deleteMany({ userId: user._id });
  res.status(204).send();
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const bcrypt = await import('bcrypt');
  const { email, password, name, role } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    role?: UserRole;
  };
  if (!email?.trim()) throw new AppError('Email обязателен', 400);
  if (!password || password.length < 6) throw new AppError('Пароль не менее 6 символов', 400);

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) throw new AppError('Пользователь с таким email уже существует', 409);

  const hashed = await bcrypt.default.hash(password, 10);
  const user = await User.create({
    email: email.trim().toLowerCase(),
    password: hashed,
    name: name?.trim(),
    role: role && ['client', 'manager', 'admin'].includes(role) ? role : 'client',
    status: 'active',
  });
  res.status(201).json(toSafeUser(user as Parameters<typeof toSafeUser>[0]));
}
