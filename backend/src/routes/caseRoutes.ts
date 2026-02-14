import { Router } from 'express';
import {
  listCases,
  getCase,
  listCasesAdmin,
  getCaseAdmin,
  createCase,
  updateCase,
  deleteCase,
} from '../controllers/caseController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

export const caseRoutes = Router();

// Public
caseRoutes.get('/', asyncHandler(listCases));

// Admin only (must be before /:id)
caseRoutes.get(
  '/admin/list',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(listCasesAdmin)
);
caseRoutes.get(
  '/admin/:id',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(getCaseAdmin)
);

caseRoutes.get('/:id', asyncHandler(getCase));

caseRoutes.post(
  '/',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(createCase)
);
caseRoutes.put(
  '/:id',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(updateCase)
);
caseRoutes.delete(
  '/:id',
  asyncHandler(authMiddleware),
  asyncHandler(requireRole('admin')),
  asyncHandler(deleteCase)
);
