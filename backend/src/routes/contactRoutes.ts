import { Router } from 'express';
import {
  createContactRequest,
  getMyContactRequests,
  getAllContactRequests,
} from '../controllers/contactController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const contactRoutes = Router();

contactRoutes.post('/', asyncHandler(optionalAuth), asyncHandler(createContactRequest));
contactRoutes.get('/me', asyncHandler(authMiddleware), asyncHandler(getMyContactRequests));
contactRoutes.get(
  '/',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(getAllContactRequests)
);
