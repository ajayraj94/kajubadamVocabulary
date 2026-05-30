/**
 * Generate a proper multi-size favicon.ico from existing PNG icons.
 * Creates ICO with 16x16, 32x32, 48x48, 64x64, 128x128 sizes.
 * Uses sharp for image resizing.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Read source PNG (192x192)
const sourcePng = readFileSync(join(projectRoot, 'public', 'icon-192x192.png'));

// We'll use sharp to resize, or fall back to using existing PNGs
async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.log('sharp not available, using png-to-ico with existing PNGs...');
    // Fallback: just use png-to-ico with the 192x192 source
    const { execSync } = await import('child_process');
    const result = execSync(
      `npx -y png-to-ico "${join(projectRoot, 'public', 'icon-192x192.png')}"`,
      { maxBuffer: 1024 * 1024 }
    );
    writeFileSync(join(projectRoot, 'app', 'favicon.ico'), result);
    console.log('Created favicon.ico from 192x192 PNG');
    return;
  }

  // Generate multiple sizes
  const sizes = [16, 32, 48, 64, 128];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(sourcePng)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ size, data: buf });
    console.log(`Generated ${size}x${size} PNG (${buf.length} bytes)`);
  }

  // Build ICO file format
  // ICO Header: 6 bytes
  // ICO Directory Entry: 16 bytes each
  // Then the actual image data
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  let dataOffset = headerSize + dirSize;

  // Calculate total size
  let totalSize = dataOffset;
  for (const { data } of pngBuffers) {
    totalSize += data.length;
  }

  const ico = Buffer.alloc(totalSize);

  // Write ICO header
  ico.writeUInt16LE(0, 0);       // Reserved, must be 0
  ico.writeUInt16LE(1, 2);       // Type: 1 = ICO
  ico.writeUInt16LE(numImages, 4); // Number of images

  // Write directory entries and image data
  let currentOffset = dataOffset;
  for (let i = 0; i < pngBuffers.length; i++) {
    const { size, data } = pngBuffers[i];
    const entryOffset = headerSize + (i * dirEntrySize);

    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset);      // Width (0 = 256)
    ico.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1);  // Height (0 = 256)
    ico.writeUInt8(0, entryOffset + 2);                         // Color palette (0 = no palette)
    ico.writeUInt8(0, entryOffset + 3);                         // Reserved
    ico.writeUInt16LE(1, entryOffset + 4);                      // Color planes
    ico.writeUInt16LE(32, entryOffset + 6);                     // Bits per pixel
    ico.writeUInt32LE(data.length, entryOffset + 8);            // Size of image data
    ico.writeUInt32LE(currentOffset, entryOffset + 12);         // Offset to image data

    data.copy(ico, currentOffset);
    currentOffset += data.length;
  }

  writeFileSync(join(projectRoot, 'app', 'favicon.ico'), ico);
  console.log(`Created favicon.ico with ${numImages} sizes: ${sizes.join(', ')} (${totalSize} bytes)`);
}

main().catch(console.error);
