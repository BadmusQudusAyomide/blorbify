import { getCloudinaryIconUrl } from './cloudinary';

const DEFAULT_ICON_ANY_192 = '/icons/icon-192.png';
const DEFAULT_ICON_ANY_512 = '/icons/icon-512.png';
const DEFAULT_ICON_MASKABLE_192 = '/icons/maskable-192.png';
const DEFAULT_ICON_MASKABLE_512 = '/icons/maskable-512.png';
const DEFAULT_APPLE_ICON = '/apple-touch-icon.png';
const DEFAULT_THEME_COLOR = '#863bff';
const DEFAULT_BACKGROUND_COLOR = '#0F1518';
const DEFAULT_NAME = 'Blorbify';

const DEFAULT_ICONS = [
  { src: DEFAULT_ICON_ANY_192, sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: DEFAULT_ICON_ANY_512, sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: DEFAULT_ICON_MASKABLE_192, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
  { src: DEFAULT_ICON_MASKABLE_512, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

// The <link rel="manifest"> we last swapped in via a blob: URL — tracked so it
// can be revoked (avoid leaking blob URLs) once it's replaced.
let activeBlobUrl = null;

function absoluteUrl(pathOrUrl) {
  try {
    return new URL(pathOrUrl, window.location.origin).toString();
  } catch {
    return pathOrUrl;
  }
}

function setLink(rel, href) {
  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

function setMeta(name, content) {
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

// Swaps in a manifest built just for the page currently open — a seller's
// dashboard or one specific storefront — so "Add to Home Screen" installs it
// under its own name/icon/color instead of the generic Blorbify app.
// Safari never reads manifest.json at all for this; it reads the
// apple-touch-icon link and apple-mobile-web-app-title meta tags directly
// from the DOM at the moment the user taps "Add to Home Screen", so those are
// updated here too.
function applyManifest({ id, name, shortName, description, startUrl, scope, themeColor, backgroundColor, icons, appleIconHref }) {
  const manifest = {
    id: absoluteUrl(id || startUrl),
    name,
    short_name: shortName || name,
    description: description || '',
    start_url: absoluteUrl(startUrl),
    scope: absoluteUrl(scope || '/'),
    display: 'standalone',
    background_color: backgroundColor || DEFAULT_BACKGROUND_COLOR,
    theme_color: themeColor || DEFAULT_THEME_COLOR,
    icons: icons.map((icon) => ({ ...icon, src: absoluteUrl(icon.src) })),
  };

  const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }));
  setLink('manifest', blobUrl);
  if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl);
  activeBlobUrl = blobUrl;

  setMeta('theme-color', themeColor || DEFAULT_THEME_COLOR);
  setMeta('apple-mobile-web-app-title', shortName || name);
  setLink('apple-touch-icon', appleIconHref ? absoluteUrl(appleIconHref) : absoluteUrl(DEFAULT_APPLE_ICON));
}

// Restores the static, generic manifest.json — call on unmount so navigating
// away from a store/dashboard back to e.g. the landing page doesn't leave
// that page's install prompt branded as someone else's store.
export function resetAppManifest() {
  setLink('manifest', '/manifest.json');
  if (activeBlobUrl) {
    URL.revokeObjectURL(activeBlobUrl);
    activeBlobUrl = null;
  }
  setMeta('theme-color', DEFAULT_THEME_COLOR);
  setMeta('apple-mobile-web-app-title', DEFAULT_NAME);
  setLink('apple-touch-icon', DEFAULT_APPLE_ICON);
}

export function applyDashboardManifest() {
  applyManifest({
    id: '/dashboard',
    name: 'Blorbify Dashboard',
    shortName: 'Blorbify',
    description: 'Manage your Blorbify store, orders, and payouts.',
    startUrl: '/dashboard',
    scope: '/',
    themeColor: DEFAULT_THEME_COLOR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    icons: DEFAULT_ICONS,
  });
}

// `theme` is the object from getTemplateTheme() — primaryColor/backgroundColor
// already resolve the seller's chosen colors (or the template's defaults).
export function applyStoreManifest(store, theme, storeSlug) {
  const slug = store?.storeSlug || storeSlug;
  if (!slug) return;

  const name = store.businessName || 'Blorbify Store';
  const primaryColor = theme?.primaryColor || DEFAULT_THEME_COLOR;
  const backgroundColor = theme?.backgroundColor || '#ffffff';
  const logoUrl = store.logoUrl || '';

  const icons = logoUrl
    ? [
        { src: getCloudinaryIconUrl(logoUrl, { size: 192 }), sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: getCloudinaryIconUrl(logoUrl, { size: 512 }), sizes: '512x512', type: 'image/png', purpose: 'any' },
        {
          src: getCloudinaryIconUrl(logoUrl, { size: 192, maskable: true, backgroundColor: primaryColor }),
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: getCloudinaryIconUrl(logoUrl, { size: 512, maskable: true, backgroundColor: primaryColor }),
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ]
    : DEFAULT_ICONS;

  applyManifest({
    id: `/${slug}`,
    name,
    shortName: name.slice(0, 30),
    description: store.description || `Shop ${name} on Blorbify.`,
    startUrl: `/${slug}`,
    scope: `/${slug}`,
    themeColor: primaryColor,
    backgroundColor,
    icons,
    appleIconHref: logoUrl ? getCloudinaryIconUrl(logoUrl, { size: 180 }) : DEFAULT_APPLE_ICON,
  });
}
