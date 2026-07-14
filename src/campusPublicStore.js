import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { createStoreSlug } from './storeLinks';
import { buildPublicStorePayload } from './publicStore';

// Campus Runs vendor products are name+price only — no image requirement,
// unlike buildPublicStorePayload's product filter which drops anything
// without an imageUrl (see src/publicStore.js).
function publishableVendorProducts(products) {
  return Array.isArray(products)
    ? products.filter((product) => product?.name && product?.status !== 'hidden')
    : [];
}

function publishableVendors(vendors) {
  return Array.isArray(vendors)
    ? vendors
      .filter((vendor) => vendor?.name && vendor?.status !== 'hidden')
      .map((vendor) => ({
        ...vendor,
        products: publishableVendorProducts(vendor.products),
      }))
    : [];
}

function publishableDeliveryLocations(deliveryLocations) {
  return Array.isArray(deliveryLocations)
    ? deliveryLocations.filter((location) => location?.name)
    : [];
}

// Builds on top of the shared payload (business info, theme, socials, etc.)
// and layers on the campus-specific vendor/delivery-location data — keeps
// this template in sync with the base store fields without duplicating them.
export function buildCampusPublicStorePayload(storeInfo, ownerId) {
  const basePayload = buildPublicStorePayload(storeInfo, ownerId);

  return {
    ...basePayload,
    vendors: publishableVendors(storeInfo.vendors),
    deliveryLocations: publishableDeliveryLocations(storeInfo.deliveryLocations),
  };
}

// Mirrors Dashboard.jsx's own private publishPublicStore() but for the
// campus-runs template's payload — kept alongside the builder so every
// caller (VendorManager, DeliveryLocationsManager) publishes identically.
export async function publishCampusPublicStore(storeInfo, ownerId) {
  const storeSlug = createStoreSlug(storeInfo.storeSlug || storeInfo.businessName || 'your-store');

  await setDoc(doc(db, 'publicStores', storeSlug), {
    ...buildCampusPublicStorePayload({ ...storeInfo, storeSlug }, ownerId),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
