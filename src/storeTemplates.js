export const storeTemplates = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, minimalist design perfect for any business',
    accent: '#AFFF00',
    surface: '#F6F8F1',
    ink: '#192328',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated look for fashion, beauty, and luxury',
    accent: '#D4AF37',
    surface: '#F7F1E7',
    ink: '#17130F',
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Vibrant and eye-catching for energetic brands',
    accent: '#FF6B35',
    surface: '#FFF4F0',
    ink: '#16191D',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, clean, and focused on your products',
    accent: '#2C3E50',
    surface: '#F4F6F6',
    ink: '#1B2631',
  },
];

export const colorPresets = [
  '#AFFF00',
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#DDA0DD',
  '#F0E68C',
];

export function getStoreTemplate(templateId) {
  return storeTemplates.find((template) => template.id === templateId) || storeTemplates[0];
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
