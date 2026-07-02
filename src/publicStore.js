import { createStoreSlug, getStoreUrl } from './storeLinks';

export function buildPublicStorePayload(storeInfo, ownerId) {
  const storeSlug = createStoreSlug(storeInfo.storeSlug || storeInfo.businessName || 'your-store');
  const products = Array.isArray(storeInfo.products)
    ? storeInfo.products.filter((product) => product?.name && product?.imageUrl)
    : [];

  return {
    ownerId,
    businessName: storeInfo.businessName || 'Your store',
    businessType: storeInfo.businessType || '',
    description: storeInfo.description || '',
    phone: storeInfo.phone || '',
    city: storeInfo.city || '',
    state: storeInfo.state || '',
    instagram: storeInfo.instagram || '',
    template: storeInfo.template || 'modern',
    primaryColor: storeInfo.primaryColor || '#AFFF00',
    logoUrl: storeInfo.logoUrl || '',
    logoPublicId: storeInfo.logoPublicId || '',
    bannerUrl: storeInfo.bannerUrl || '',
    bannerPublicId: storeInfo.bannerPublicId || '',
    deliveryFee: Number(storeInfo.deliveryFee || 0),
    storeSlug,
    storeUrl: getStoreUrl(storeSlug),
    products,
    published: true,
  };
}
