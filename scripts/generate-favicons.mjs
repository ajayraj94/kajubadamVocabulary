import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const svgPath = join(root, "public", "favicon.svg");
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
];

async function main() {
  for (const { name, size } of sizes) {
    const outPath = join(root, "public", name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✅ Generated ${name} (${size}x${size})`);
  }

  // Also create favicon.ico-compatible PNG (browsers accept PNG as favicon.ico)
  const ico32 = sizes.find(s => s.name === "favicon-32x32.png");
  // Copy 32x32 as the primary favicon PNG
  const faviconPng = join(root, "public", "favicon.png");
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPng);
  console.log(`✅ Generated favicon.png (32x32)`);
}

main().catch(console.error);
