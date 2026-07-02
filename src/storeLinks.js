export function getPublicStoreBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_PUBLIC_STORE_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/g, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'https://blorbify.vercel.app';
}

export function createStoreSlug(value) {
  return (
    (value || 'my-store')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'my-store'
  );
}

export function getStoreUrl(slug) {
  return `${getPublicStoreBaseUrl()}/${createStoreSlug(slug)}`;
}
