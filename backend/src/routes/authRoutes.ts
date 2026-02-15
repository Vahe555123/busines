import { Router } from 'express';
import {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  getMe,
  googleRedirect,
  googleCallback,
} from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRoutes = Router();

authRoutes.post('/register', asyncHandler(register));
authRoutes.post('/verify-email', asyncHandler(verifyEmail));
authRoutes.post('/resend-code', asyncHandler(resendVerificationCode));
authRoutes.post('/login', asyncHandler(login));
authRoutes.get('/me', asyncHandler(authMiddleware), asyncHandler(getMe));

authRoutes.get('/google', googleRedirect);
authRoutes.get('/google/callback', asyncHandler(googleCallback));
