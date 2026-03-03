const path = require('path');
const jimp = require('jimp');
const { Jimp } = jimp;

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
  const maxWidth = image.bitmap.width;
  const maxHeight = image.bitmap.height;
  const size = Math.min(crop.size, maxWidth, maxHeight);
  const x = Math.max(0, Math.min(crop.x, maxWidth - size));
  const y = Math.max(0, Math.min(crop.y, maxHeight - size));
  return { x, y, size };
}

function createRing(size, hexColor = 0xf8fafcff) {
  const ring = new Jimp({ width: size, height: size, color: 0x00000000 });
  const center = size / 2;
  const outerRadius = size * 0.472;
  const innerRadius = size * 0.455;

  ring.scan(0, 0, size, size, function scanPixel(x, y, idx) {
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const inRing = distance <= outerRadius && distance >= innerRadius;

    if (inRing) {
      this.bitmap.data[idx + 0] = (hexColor >> 24) & 255;
      this.bitmap.data[idx + 1] = (hexColor >> 16) & 255;
      this.bitmap.data[idx + 2] = (hexColor >> 8) & 255;
      this.bitmap.data[idx + 3] = hexColor & 255;
    }
  });

  return ring;
}

function applyCircularAlpha(image, size) {
  const center = size / 2;
  const radius = size * 0.47;

  image.scan(0, 0, size, size, function scanPixel(x, y, idx) {
    const dx = x - center;
    const dy = y - center;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > radius) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
}

async function buildAvatar(config) {
  const inputPath = path.resolve(config.src);
  const outputPath = path.resolve(config.out);

  const source = await Jimp.read(inputPath);
  const crop = clampCrop(source, config.crop);

  source.crop({ x: crop.x, y: crop.y, w: crop.size, h: crop.size });
  source.resize({ w: OUTPUT_SIZE, h: OUTPUT_SIZE });

  // Cartoon-like stylization: stronger colors and reduced color depth.
  source
    .normalize()
    .contrast(0.15)
    .posterize(14)
    .color([{ apply: 'saturate', params: [20] }]);

  applyCircularAlpha(source, OUTPUT_SIZE);

  const ring = createRing(OUTPUT_SIZE, 0xe2e8f0ff);
  source.composite(ring, 0, 0);

  await source.write(outputPath);
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
