import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';
import { pricingRoutes } from './pricingRoutes.js';
import { purchaseRoutes } from './purchaseRoutes.js';
import { contactRoutes } from './contactRoutes.js';
import { chatRoutes } from './chatRoutes.js';
import { caseRoutes } from './caseRoutes.js';
import { uploadRoutes } from './uploadRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/upload', uploadRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/pricing', pricingRoutes);
apiRouter.use('/purchases', purchaseRoutes);
apiRouter.use('/contact-requests', contactRoutes);
apiRouter.use('/cases', caseRoutes);
apiRouter.use('/chat', chatRoutes);

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'API v1', docs: '/api' });
});
