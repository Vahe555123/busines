import { Router } from 'express';
import {
  createPurchase,
  createPayment,
  getPaymentStatus,
  yooWebhook,
  getMyPurchases,
  getPurchasesByUser,
  updatePurchaseStatus,
} from '../controllers/purchaseController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const purchaseRoutes = Router();

purchaseRoutes.post('/', asyncHandler(authMiddleware), asyncHandler(createPurchase));
purchaseRoutes.post('/create-payment', asyncHandler(authMiddleware), asyncHandler(createPayment));
purchaseRoutes.get('/check-payment/:paymentId', asyncHandler(authMiddleware), asyncHandler(getPaymentStatus));
purchaseRoutes.post('/yoo-webhook', asyncHandler(yooWebhook));
purchaseRoutes.get('/me', asyncHandler(authMiddleware), asyncHandler(getMyPurchases));

purchaseRoutes.get(
  '/user/:userId',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(getPurchasesByUser)
);
purchaseRoutes.patch(
  '/:id/status',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(updatePurchaseStatus)
);
