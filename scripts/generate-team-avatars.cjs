const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_SIZE = 1024;

const AVATAR_CONFIGS = [
  {
    name: 'luca-cartoon',
    src: 'public/team/source/Luca.jpeg',
    out: 'public/team/avatars/luca-cartoon.png',
    crop: { x: 200, y: 110, size: 820 }
  },
  {
    name: 'lucie-cartoon',
    src: 'public/team/source/lucie.jpeg',
    out: 'public/team/avatars/lucie-cartoon.png',
    crop: { x: 20, y: 40, size: 360 }
  }
];

function clampCrop(image, crop) {
  const maxWidth = image.width;
  const maxHeight = image.height;
  const size = Math.min(crop.size, maxWidth, maxHeight);
  const x = Math.max(0, Math.min(crop.x, maxWidth - size));
  const y = Math.max(0, Math.min(crop.y, maxHeight - size));
  return { x, y, size };
}

function createCircleMaskSvg(size) {
  const radius = Math.round(size * 0.47);
  const center = Math.round(size / 2);
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="black"/>
      <circle cx="${center}" cy="${center}" r="${radius}" fill="white"/>
    </svg>`
  );
}

function createRingSvg(size, strokeColor = '#e2e8f0') {
  const radius = Math.round(size * 0.4635);
  const center = Math.round(size / 2);
  const strokeWidth = Math.max(4, Math.round(size * 0.017));
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </svg>`
  );
}

async function buildAvatar(config) {
  const inputPath = path.resolve(config.src);
  const outputPath = path.resolve(config.out);
  const metadata = await sharp(inputPath).metadata();
  const crop = clampCrop(metadata, config.crop);

  const maskSvg = createCircleMaskSvg(OUTPUT_SIZE);
  const ringSvg = createRingSvg(OUTPUT_SIZE);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  await sharp(inputPath)
    .extract({ left: crop.x, top: crop.y, width: crop.size, height: crop.size })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE)
    .normalise()
    .modulate({ saturation: 1.2, brightness: 1.03 })
    .linear(1.08, -(255 * 0.04))
    .composite([
      { input: maskSvg, blend: 'dest-in' },
      { input: ringSvg, blend: 'over' }
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function main() {
  for (const config of AVATAR_CONFIGS) {
    const out = await buildAvatar(config);
    console.log(`[avatar] ${config.name} -> ${out}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
