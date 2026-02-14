import { Router } from 'express';
import {
  listPricing,
  getPricing,
  createPricing,
  updatePricing,
  deletePricing,
} from '../controllers/pricingController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const pricingRoutes = Router();

pricingRoutes.get('/', asyncHandler(listPricing));
pricingRoutes.get('/:id', asyncHandler(getPricing));
pricingRoutes.post(
  '/',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(createPricing)
);
pricingRoutes.put(
  '/:id',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(updatePricing)
);
pricingRoutes.delete(
  '/:id',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(deletePricing)
);
