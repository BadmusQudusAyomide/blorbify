export const signatureTemplate = {
  id: 'signature',
  name: 'Signature',
  description: "Blorbify's flagship storefront — clean, editorial, and built to convert.",
  accent: '#AFFF00',
  surface: '#F6F8F1',
  ink: '#141B1E',
  card: '#FFFFFF',
  button: '#141B1E',
  buttonText: '#F6F8F1',
  layout: 'signature',
};

export const noirTemplate = {
  id: 'noir',
  name: 'Noir',
  description: 'A bold, dark gallery storefront with full-bleed imagery — for fashion, art, and premium brands.',
  accent: '#D9A441',
  surface: '#0B0B0C',
  ink: '#F5F5F2',
  card: '#17171A',
  button: '#F5F5F2',
  buttonText: '#0B0B0C',
  layout: 'noir',
};

export const bloomTemplate = {
  id: 'bloom',
  name: 'Bloom',
  description: 'A soft, calming storefront with rounded product cards — for beauty, skincare, and wellness brands.',
  accent: '#C98A82',
  surface: '#FBF3EF',
  ink: '#3A2E2C',
  card: '#FFFFFF',
  button: '#C98A82',
  buttonText: '#FFFFFF',
  layout: 'bloom',
};

export const kitchenTemplate = {
  id: 'kitchen',
  name: 'Kitchen',
  description: 'A warm, appetizing storefront styled like a menu — for food, drinks, and home kitchens.',
  accent: '#C1440E',
  surface: '#FFF8F0',
  ink: '#2B1810',
  card: '#FFFFFF',
  button: '#C1440E',
  buttonText: '#FFF8F0',
  layout: 'kitchen',
};

export const atelierTemplate = {
  id: 'atelier',
  name: 'Atelier',
  description: 'A warm, artisanal storefront that puts your story first — for handmade goods and makers.',
  accent: '#A8752E',
  surface: '#F5EFE6',
  ink: '#3E2F25',
  card: '#FBF6EE',
  button: '#3E2F25',
  buttonText: '#F5EFE6',
  layout: 'atelier',
};

export const voltTemplate = {
  id: 'volt',
  name: 'Volt',
  description: 'A bold, high-energy storefront with big type and hard shadows — for streetwear and Gen-Z brands.',
  accent: '#FF3EA5',
  surface: '#0B0B10',
  ink: '#F5F3EF',
  card: '#151318',
  button: '#FF3EA5',
  buttonText: '#0B0B10',
  layout: 'volt',
};

export const novaTemplate = {
  id: 'nova',
  name: 'Nova',
  description: 'A crisp, modern storefront with spec-sheet precision — for electronics, gadgets, and tech brands.',
  accent: '#3B82F6',
  surface: '#F4F6F8',
  ink: '#12161A',
  card: '#FFFFFF',
  button: '#12161A',
  buttonText: '#F4F6F8',
  layout: 'nova',
};

export const boutiqueTemplate = {
  id: 'boutique',
  name: 'Boutique',
  description: 'An elegant, editorial storefront with soft neutrals and serif type — for clothing boutiques and apparel brands.',
  accent: '#B08463',
  surface: '#FAF6F1',
  ink: '#2A2320',
  card: '#FFFFFF',
  button: '#2A2320',
  buttonText: '#FAF6F1',
  layout: 'boutique',
};

export const runwayTemplate = {
  id: 'runway',
  name: 'Runway',
  description: 'A bold, editorial fashion storefront with oversized type and runway-show energy — for clothing brands that want to make a statement.',
  accent: '#E10600',
  surface: '#FFFFFF',
  ink: '#0A0A0A',
  card: '#FFFFFF',
  button: '#0A0A0A',
  buttonText: '#FFFFFF',
  layout: 'runway',
};

export const storeTemplates = [signatureTemplate, noirTemplate, bloomTemplate, kitchenTemplate, atelierTemplate, voltTemplate, novaTemplate, boutiqueTemplate, runwayTemplate];

export const colorPresets = [
  '#AFFF00',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#DDA0DD',
  '#F0E68C',
  '#4A5D45',
  '#B5603F',
  '#008A5B',
  '#57D9FF',
  '#17130F',
];

export const defaultStoreCopy = {
  announcement: '',
  heroEyebrow: '',
  heroHeadline: '',
  heroSubtext: '',
  primaryButtonLabel: 'Shop products',
  secondaryButtonLabel: 'Call store',
  productsHeading: 'Shop products',
  productsSubheading: '',
  addToCartLabel: 'Add to cart',
  checkoutLabel: 'Place order',
  footerText: '',
};

export const socialLinkFields = [
  { key: 'instagram', label: 'Instagram', placeholder: '@yourbrand or https://instagram.com/yourbrand' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourbrand' },
  { key: 'twitter', label: 'X / Twitter', placeholder: '@yourbrand or https://x.com/yourbrand' },
  { key: 'tiktok', label: 'TikTok', placeholder: '@yourbrand or https://tiktok.com/@yourbrand' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '08012345678 or https://wa.me/234...' },
  { key: 'email', label: 'Email', placeholder: 'hello@yourbrand.com' },
];

export function getStoreTemplate(templateId) {
  return storeTemplates.find((template) => template.id === templateId) || signatureTemplate;
}

export function getReadableTextColor(backgroundColor, dark = '#192328', light = '#FFFFFF') {
  const hex = String(backgroundColor || '').replace('#', '').trim();
  const normalizedHex = hex.length === 3
    ? hex.split('').map((character) => `${character}${character}`).join('')
    : hex;

  if (!/^[0-9a-f]{6}$/i.test(normalizedHex)) {
    return dark;
  }

  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance > 150 ? dark : light;
}

export function getTemplateTheme(templateId, overrides = {}) {
  const template = getStoreTemplate(templateId);
  const primaryColor = overrides.primaryColor || template.accent;
  const backgroundColor = overrides.backgroundColor || template.surface;
  const textColor = overrides.textColor || template.ink;
  const cardColor = overrides.cardColor || template.card || '#FFFFFF';
  const buttonColor = overrides.buttonColor || template.button || primaryColor;
  const buttonTextColor = overrides.buttonTextColor || template.buttonText || getReadableTextColor(buttonColor, textColor);

  return {
    primaryColor,
    backgroundColor,
    textColor,
    cardColor,
    buttonColor,
    buttonTextColor,
  };
}

export function getStoreCopy(store = {}) {
  return {
    ...defaultStoreCopy,
    announcement: store.announcement || defaultStoreCopy.announcement,
    heroEyebrow: store.heroEyebrow || defaultStoreCopy.heroEyebrow,
    heroHeadline: store.heroHeadline || defaultStoreCopy.heroHeadline,
    heroSubtext: store.heroSubtext || defaultStoreCopy.heroSubtext,
    primaryButtonLabel: store.primaryButtonLabel || defaultStoreCopy.primaryButtonLabel,
    secondaryButtonLabel: store.secondaryButtonLabel || defaultStoreCopy.secondaryButtonLabel,
    productsHeading: store.productsHeading || defaultStoreCopy.productsHeading,
    productsSubheading: store.productsSubheading || defaultStoreCopy.productsSubheading,
    addToCartLabel: store.addToCartLabel || defaultStoreCopy.addToCartLabel,
    checkoutLabel: store.checkoutLabel || defaultStoreCopy.checkoutLabel,
    footerText: store.footerText || defaultStoreCopy.footerText,
  };
}

export function getStoreSocialLinks(store = {}) {
  return socialLinkFields.reduce((links, field) => {
    links[field.key] = store[field.key] || '';
    return links;
  }, {});
}
