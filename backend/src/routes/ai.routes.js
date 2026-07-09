import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createProductDescription } from '../controllers/ai.controller.js';

const router = Router();

router.post('/product-description', requireAuth, createProductDescription);

export default router;
