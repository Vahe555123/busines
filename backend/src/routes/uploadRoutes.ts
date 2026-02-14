import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { uploadAnyImage } from '../config/upload.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const uploadRoutes = Router();

uploadRoutes.post(
  '/',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  (req, res, next) => {
    uploadAnyImage.single('image')(req, res, (err) => {
      if (err) next(err);
      else next();
    });
  },
  asyncHandler(uploadImage)
);
