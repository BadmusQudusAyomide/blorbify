import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireRelaySecret } from '../middleware/relayAuth.js';
import { ok } from '../utils/response.js';
import { sweepAbandonedCarts } from '../services/cartSweep.service.js';
import { reconcileAllSellerBalances } from '../services/sellerOrder.service.js';
import { runMonthlyReportJob } from '../services/monthlyReport.service.js';
import { adminDb } from '../config/firebaseAdmin.js';
import { toCsv } from '../utils/csv.js';

const router = Router();

// Lets the sweep be triggered on demand (testing, or an external scheduler)
// instead of only via the in-process interval in server.js.
router.post('/cart-sweep', requireRelaySecret, asyncHandler(async (req, res) => {
  const result = await sweepAbandonedCarts();
  return ok(res, { data: result });
}));

// Platform-wide ledger export for the founder — gated by the same shared-secret
// mechanism as the rest of this file rather than building a separate admin-auth
// concept, since the only consumer is a manual/scripted download, not a dashboard.
router.get('/ledger.csv', requireRelaySecret, asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const startAt = from ? new Date(from) : null;
  const endAt = to ? new Date(to) : null;

  let query = adminDb.collection('sellerLedgers');
  if (startAt) query = query.where('createdAt', '>=', startAt);
  if (endAt) query = query.where('createdAt', '<', endAt);

  const snapshot = await query.get();
  const rows = snapshot.docs.map((doc) => {
    const entry = doc.data();
    return { ...entry, createdAt: entry.createdAt?.toDate ? entry.createdAt.toDate().toISOString() : '' };
  });

  const csv = toCsv(rows, [
    { key: 'createdAt', header: 'Date' },
    { key: 'sellerId', header: 'Seller ID' },
    { key: 'type', header: 'Type' },
    { key: 'reference', header: 'Reference' },
    { key: 'orderId', header: 'Order ID' },
    { key: 'grossAmount', header: 'Gross amount (kobo)' },
    { key: 'sellerNetAmount', header: 'Net amount (kobo)' },
    { key: 'currency', header: 'Currency' },
    { key: 'status', header: 'Status' },
    { key: 'reason', header: 'Reason' },
  ]);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="platform-ledger.csv"');
  res.send(csv);
}));

// On-demand twin of the daily in-process timer in server.js — for manual
// backfill/testing, or an external scheduler if belt-and-suspenders is wanted.
router.post('/monthly-report', requireRelaySecret, asyncHandler(async (req, res) => {
  const { monthKey, force } = req.body || {};
  const result = await runMonthlyReportJob({ monthKey, force: Boolean(force) });
  return ok(res, { data: result });
}));

router.get('/reconciliation', requireRelaySecret, asyncHandler(async (req, res) => {
  const result = await reconcileAllSellerBalances();
  return ok(res, { data: result });
}));

export default router;
