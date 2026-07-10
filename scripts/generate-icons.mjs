// One-off/regen script: rasterizes public/favicon.svg into the PNG icons the
// web app manifest needs (regular + maskable, plus an iOS apple-touch-icon).
// Re-run with `npm run generate:icons` any time favicon.svg changes.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SVG_PATH = path.join(ROOT, 'public', 'favicon.svg');
const OUT_DIR = path.join(ROOT, 'public', 'icons');

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

// Maskable icons get cropped into a circle/squircle on Android, so the mark
// itself only fills the center "safe zone" — the rest is background padding.
const MASKABLE_SAFE_ZONE_RATIO = 0.6;

async function renderIcon({ size, background, contentRatio = 1, outFile }) {
  const contentSize = Math.round(size * contentRatio);
  const mark = await sharp(SVG_PATH)
    .resize(contentSize, contentSize, { fit: 'contain', background: TRANSPARENT })
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(outFile);

  console.log(`wrote ${path.relative(ROOT, outFile)}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await renderIcon({ size: 192, background: WHITE, outFile: path.join(OUT_DIR, 'icon-192.png') });
  await renderIcon({ size: 512, background: WHITE, outFile: path.join(OUT_DIR, 'icon-512.png') });
  await renderIcon({
    size: 192,
    background: WHITE,
    contentRatio: MASKABLE_SAFE_ZONE_RATIO,
    outFile: path.join(OUT_DIR, 'maskable-192.png'),
  });
  await renderIcon({
    size: 512,
    background: WHITE,
    contentRatio: MASKABLE_SAFE_ZONE_RATIO,
    outFile: path.join(OUT_DIR, 'maskable-512.png'),
  });
  // iOS ignores manifest icons entirely for "Add to Home Screen" and reads
  // this link tag instead; it also can't render transparency, hence the
  // solid background.
  await renderIcon({ size: 180, background: WHITE, outFile: path.join(ROOT, 'public', 'apple-touch-icon.png') });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
