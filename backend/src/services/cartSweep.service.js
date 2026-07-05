import { adminDb, fieldValue, timestamp } from '../config/firebaseAdmin.js';
import { sendAbandonedCartEmail } from './notification.service.js';

const CART_SNAPSHOTS_COLLECTION = 'cartSnapshots';
const ABANDONED_AFTER_MS = 2 * 60 * 60 * 1000;
const EXPIRE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

// Finds carts that have sat untouched past the abandonment window and haven't
// been nudged yet, emails the customer, and marks them notified. Also expires
// old snapshots outright (notified or not) so this collection doesn't grow
// unbounded — the original design had no TTL for that.
export async function sweepAbandonedCarts() {
  const now = Date.now();
  const abandonedCutoff = timestamp.fromMillis(now - ABANDONED_AFTER_MS);
  const expireCutoff = timestamp.fromMillis(now - EXPIRE_AFTER_MS);

  const expiredSnap = await adminDb
    .collection(CART_SNAPSHOTS_COLLECTION)
    .where('updatedAt', '<', expireCutoff)
    .get();

  await Promise.all(expiredSnap.docs.map((snapshotDoc) => snapshotDoc.ref.delete()));

  // Filters `notifiedAt` in memory rather than adding it as a second `where`
  // clause — combining a range filter with an equality filter on a different
  // field would need a composite Firestore index; this collection is small
  // enough that an in-memory filter is simpler than managing one.
  const staleSnap = await adminDb
    .collection(CART_SNAPSHOTS_COLLECTION)
    .where('updatedAt', '<', abandonedCutoff)
    .get();
  const staleDocs = staleSnap.docs.filter((snapshotDoc) => !snapshotDoc.data().notifiedAt);

  let notified = 0;
  for (const snapshotDoc of staleDocs) {
    const cart = snapshotDoc.data();
    try {
      const result = await sendAbandonedCartEmail({
        toEmail: cart.customerEmail,
        toName: cart.customerName,
        storeName: cart.storeName,
        storeSlug: cart.storeSlug,
      });
      if (result?.sent || result?.queued) {
        notified += 1;
      }
      await snapshotDoc.ref.set({ notifiedAt: fieldValue.serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error(`Abandoned cart email failed for ${snapshotDoc.id}:`, error.message);
    }
  }

  return { expired: expiredSnap.size, notified, checked: staleDocs.length };
}
