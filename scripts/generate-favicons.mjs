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

  // Generate favicon.ico (multi-size ICO with 16x16 + 32x32 + 48x48)
  // Sharp can't output .ico directly, so we generate PNGs and write them as ICO header
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  // Build ICO file manually
  // ICO header: reserved(2) + type(2) + count(2)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);   // reserved
  header.writeUInt16LE(1, 2);   // type = 1 (ICO)
  header.writeUInt16LE(3, 4);   // count = 3 images

  // Directory entries (16 bytes each)
  const images = [
    { data: ico16, w: 16, h: 16, bpp: 32 },
    { data: ico32, w: 32, h: 32, bpp: 32 },
    { data: ico48, w: 48, h: 48, bpp: 32 },
  ];

  let offset = 6 + images.length * 16;
  const dirEntries = [];
  const imageData = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.w >= 256 ? 0 : img.w, 0);  // width
    entry.writeUInt8(img.h >= 256 ? 0 : img.h, 1);  // height
    entry.writeUInt8(0, 2);   // colors
    entry.writeUInt8(0, 3);   // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(img.bpp, 6); // bits per pixel
    entry.writeUInt32LE(img.data.length, 8);  // size
    entry.writeUInt32LE(offset, 12); // offset
    offset += img.data.length;
    dirEntries.push(entry);
    imageData.push(img.data);
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...imageData]);
  writeFileSync(join(root, "public", "favicon.ico"), icoBuffer);
  console.log(`✅ Generated favicon.ico (16x16 + 32x32 + 48x48)`);
}

main().catch(console.error);
