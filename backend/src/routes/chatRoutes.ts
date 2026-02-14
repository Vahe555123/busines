import { Router } from 'express';
import {
  getOrCreateConversation,
  sendMessage,
  uploadImage,
  listConversationsAdmin,
  getConversationAdmin,
} from '../controllers/chatController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { uploadChatImage } from '../config/upload.js';

export const chatRoutes = Router();

chatRoutes.post('/history', asyncHandler(optionalAuth), asyncHandler(getOrCreateConversation));
chatRoutes.get('/history', asyncHandler(optionalAuth), asyncHandler(getOrCreateConversation));
chatRoutes.post('/send', asyncHandler(optionalAuth), asyncHandler(sendMessage));
chatRoutes.post(
  '/upload',
  asyncHandler(optionalAuth),
  (req, res, next) => {
    uploadChatImage.single('image')(req, res, (err) => {
      if (err) next(err);
      else next();
    });
  },
  asyncHandler(uploadImage)
);

chatRoutes.get(
  '/admin/conversations',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(listConversationsAdmin)
);
chatRoutes.get(
  '/admin/conversations/:id',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(getConversationAdmin)
);
