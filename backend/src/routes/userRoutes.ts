import { Router } from 'express';
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} from '../controllers/adminUserController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const userRoutes = Router();

userRoutes.use(asyncHandler(authMiddleware), asyncHandler(requireRole('admin')));

userRoutes.get('/', asyncHandler(listUsers));
userRoutes.get('/:id', asyncHandler(getUserById));
userRoutes.post('/', asyncHandler(createUser));
userRoutes.patch('/:id', asyncHandler(updateUser));
userRoutes.delete('/:id', asyncHandler(deleteUser));
