import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import {
  generateVerificationCode,
  getVerificationExpires,
  sendVerificationEmail,
} from '../services/mailService.js';

const SALT_ROUNDS = 10;

export function toSafeUser(user: {
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
    role: (user as { role?: string }).role ?? 'client',
    status: u.status ?? 'active',
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email?.trim()) {
    throw new AppError('Email обязателен', 400);
  }
  if (!password || password.length < 6) {
    throw new AppError('Пароль обязателен и не менее 6 символов', 400);
  }

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    throw new AppError('Пользователь с таким email уже зарегистрирован', 409);
  }

  const hashedPassword = await bcrypt.hash(password!, SALT_ROUNDS);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = getVerificationExpires();

  const user = await User.create({
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    name: name?.trim(),
    isVerified: false,
    verificationCode,
    verificationCodeExpires,
  });

  await sendVerificationEmail(user.email, verificationCode);

  res.status(201).json({
    message: 'Регистрация успешна. Проверьте почту для подтверждения.',
    user: toSafeUser(user),
  });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email?.trim() || !code?.trim()) {
    throw new AppError('Укажите email и код подтверждения', 400);
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select('+verificationCode +verificationCodeExpires');

  if (!user) {
    throw new AppError('Пользователь не найден', 404);
  }
  if (user.isVerified) {
    throw new AppError('Почта уже подтверждена', 400);
  }
  if (!user.verificationCode || user.verificationCode !== code.trim()) {
    throw new AppError('Неверный код подтверждения', 400);
  }
  if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
    throw new AppError('Код истёк. Запросите новый.', 400);
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  res.json({
    message: 'Почта успешно подтверждена',
    user: toSafeUser(user),
  });
}

export async function resendVerificationCode(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };

  if (!email?.trim()) {
    throw new AppError('Укажите email', 400);
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select('+verificationCode +verificationCodeExpires');

  if (!user) {
    throw new AppError('Пользователь не найден', 404);
  }
  if (user.isVerified) {
    throw new AppError('Почта уже подтверждена', 400);
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = getVerificationExpires();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = verificationCodeExpires;
  await user.save();

  await sendVerificationEmail(user.email, verificationCode);

  res.json({
    message: 'Новый код подтверждения отправлен на почту',
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    throw new AppError('Укажите email и пароль', 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user) {
    throw new AppError('Неверный email или пароль', 401);
  }
  if (user.googleId) {
    throw new AppError('Войдите через Google', 400);
  }
  if (!user.password) {
    throw new AppError('Неверный email или пароль', 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Неверный email или пароль', 401);
  }

  const token = signToken({ userId: user._id.toString(), email: user.email });

  res.json({
    message: 'Вход выполнен',
    token,
    user: toSafeUser(user),
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    throw new AppError('Пользователь не найден', 401);
  }
  res.json({ user: toSafeUser(user) });
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? '';
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:8080';

export function googleRedirect(_req: Request, res: Response): void {
  if (!GOOGLE_CLIENT_ID) {
    res.redirect(`${FRONTEND_URL}/auth?error=google_not_configured`);
    return;
  }
  const redirectUri = `${API_BASE_URL}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(url);
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const { code, error } = req.query as { code?: string; error?: string };
  if (error || !code) {
    res.redirect(`${FRONTEND_URL}/auth?error=${error ?? 'no_code'}`);
    return;
  }
  if (!GOOGLE_CLIENT_SECRET) {
    res.redirect(`${FRONTEND_URL}/auth?error=google_not_configured`);
    return;
  }

  const redirectUri = `${API_BASE_URL}/api/auth/google/callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    res.redirect(`${FRONTEND_URL}/auth?error=token_failed`);
    return;
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = (await userRes.json()) as { id?: string; email?: string; name?: string };
  if (!profile.email) {
    res.redirect(`${FRONTEND_URL}/auth?error=no_email`);
    return;
  }

  const email = profile.email.toLowerCase();
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      user.googleId = profile.id;
      user.name = user.name || profile.name;
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        email,
        googleId: profile.id,
        name: profile.name?.trim(),
        isVerified: true,
      });
    }
  }

  if (user.status === 'blocked') {
    res.redirect(`${FRONTEND_URL}/auth?error=blocked`);
    return;
  }

  const token = signToken({ userId: (user._id as { toString(): string }).toString(), email: user.email });
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}`);
}
