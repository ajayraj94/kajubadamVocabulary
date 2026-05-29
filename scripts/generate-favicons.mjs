import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Complex SVG (gradients, details) — used for larger sizes (180px+)
const svgFullPath = join(root, "public", "favicon.svg");
const svgFullBuffer = readFileSync(svgFullPath);

// Simplified SVG (solid colors, bold shapes) — used for small sizes (≤32px, favicon.ico)
// At small sizes, gradients and fine details become an unreadable blur.
const svgSimplePath = join(root, "public", "favicon-simple.svg");
const svgSimpleBuffer = readFileSync(svgSimplePath);

const sizes = [
  // Small sizes use the simplified SVG for crisp rendering at tiny resolutions
  { name: "favicon-16x16.png", size: 16, source: svgSimpleBuffer },
  { name: "favicon-32x32.png", size: 32, source: svgSimpleBuffer },
  // Large sizes use the full complex SVG for maximum detail
  { name: "apple-touch-icon.png", size: 180, source: svgFullBuffer },
  { name: "icon-192x192.png", size: 192, source: svgFullBuffer },
  { name: "icon-512x512.png", size: 512, source: svgFullBuffer },
];

async function main() {
  for (const { name, size, source } of sizes) {
    const outPath = join(root, "public", name);
    await sharp(source)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`✅ Generated ${name} (${size}x${size})`);
  }

  // Note: favicon.ico deliberately NOT generated to avoid Next.js auto-linking.
  // Next.js automatically adds a <link rel="icon"> tag when it detects
  // public/favicon.ico, which conflicts with our custom metadata (no ?v= cache-bust).
  // PNG favicons work in all modern browsers including Safari.
}

main().catch(console.error);
