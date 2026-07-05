import { useEffect, useRef } from 'react';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function buildSnapshotId(storeSlug, email) {
  return `${storeSlug}__${encodeURIComponent(email.toLowerCase())}`;
}

// Debounced-upserts a snapshot of the in-progress cart once the buyer has
// entered an email, so the backend can nudge them later if they never check
// out. Cart state itself stays purely in localStorage (useCart.js) — this is
// a separate, minimal mirror written only when there's an email to notify.
export function useCartSnapshotSync({ storeSlug, published, cart, cartSubtotal, storeName, customer }) {
  const idRef = useRef('');
  const email = customer?.email?.trim().toLowerCase() || '';

  useEffect(() => {
    if (!storeSlug || !published || !email || !cart.length) return undefined;

    const snapshotId = buildSnapshotId(storeSlug, email);
    idRef.current = snapshotId;

    const timeout = setTimeout(() => {
      setDoc(
        doc(db, 'cartSnapshots', snapshotId),
        {
          storeSlug,
          storeName: storeName || '',
          customerEmail: email,
          customerName: customer?.name?.trim() || '',
          items: cart.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
          subtotal: cartSubtotal,
          updatedAt: serverTimestamp(),
          notifiedAt: null,
        },
        { merge: true }
      ).catch((error) => {
        console.error('Cart snapshot sync failed:', error);
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [storeSlug, published, email, cart, cartSubtotal, storeName, customer?.name]);

  const clearSnapshot = () => {
    if (!idRef.current) return;
    const snapshotId = idRef.current;
    idRef.current = '';
    deleteDoc(doc(db, 'cartSnapshots', snapshotId)).catch((error) => {
      console.error('Cart snapshot clear failed:', error);
    });
  };

  return { clearSnapshot };
}
