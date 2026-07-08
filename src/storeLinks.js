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

export const RESERVED_STORE_SLUGS = [
  'login', 'signup', 'onboarding', 'dashboard', 'verify-email', 'payment',
  'admin', 'api', 'app', 'www', 'store', 'stores',
];

export function validateStoreSlugFormat(rawValue) {
  if (!rawValue || !rawValue.trim()) return 'Store URL is required.';
  const normalized = createStoreSlug(rawValue);
  if (normalized.length < 3) return 'Store URL must be at least 3 characters.';
  if (RESERVED_STORE_SLUGS.includes(normalized)) return 'This URL is reserved. Please choose another.';
  return '';
}
