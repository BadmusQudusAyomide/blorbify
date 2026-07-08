import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdminEmail } from '../middleware/adminAuth.js';
import {
  getNotifications,
  getOrders,
  getOverview,
  getSellers,
  getSupportConversations,
  getSupportMessagesForConversation,
  postSupportReply,
  postSupportRead,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdminEmail);

router.get('/overview', getOverview);
router.get('/sellers', getSellers);
router.get('/orders', getOrders);
router.get('/notifications', getNotifications);
router.get('/support/conversations', getSupportConversations);
router.get('/support/conversations/:sellerId/messages', getSupportMessagesForConversation);
router.post('/support/conversations/:sellerId/messages', postSupportReply);
router.post('/support/conversations/:sellerId/read', postSupportRead);

export default router;
