function referralStorageKey(slug) {
  return `blorbify:ref:${slug || 'store'}`;
}

export function getStoredReferral(slug) {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(referralStorageKey(slug)) || '';
  } catch {
    return '';
  }
}

export function storeReferral(slug, code) {
  if (typeof window === 'undefined' || !code) return;
  try {
    window.localStorage.setItem(referralStorageKey(slug), code);
  } catch {
    // Storage can fail in private-browsing contexts; referral attribution is best-effort.
  }
}
