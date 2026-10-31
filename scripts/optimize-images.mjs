// Converts JPG/PNG files in /public to web-sized WebP.
//
// Usage: pnpm optimize-images
//
// - Resizes to at most 1200px wide (never upscales) and encodes WebP at q78,
//   stepping quality down until the file is under ~200 KB.
// - SVGs and favicon/app icons are left untouched.
// - The original is deleted only when nothing in src/ still references its
//   filename; otherwise it is kept and the referencing files are listed so they
//   can be pointed at the new .webp first.

import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const publicDir = path.join(root, "public");
const srcDir = path.join(root, "src");

const maxWidth = 1200;
const targetBytes = 200 * 1024;
const qualities = [78, 72, 66, 60];
const rasterPattern = /\.(jpe?g|png)$/i;
const skipPattern = /^(favicon|apple-touch-icon|icon|android-chrome)/i;
const sourcePattern = /\.(tsx?|jsx?|mjs|css|json|md)$/i;

async function walk(dir, pattern) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath, pattern);
      return pattern.test(entry.name) ? [fullPath] : [];
    }),
  );
  return files.flat();
}

async function encode(input) {
  let output;
  for (const quality of qualities) {
    output = await sharp(input)
      .rotate()
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (output.length <= targetBytes) return { output, quality };
  }
  return { output, quality: qualities.at(-1) };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

const images = (await walk(publicDir, rasterPattern)).filter(
  (file) => !skipPattern.test(path.basename(file)),
);

if (images.length === 0) {
  console.log("No JPG/PNG files to optimize in public/.");
  process.exit(0);
}

const sources = await Promise.all(
  (await walk(srcDir, sourcePattern)).map(async (file) => ({
    file,
    text: await readFile(file, "utf8"),
  })),
);

let before = 0;
let after = 0;

for (const image of images) {
  const relative = path.relative(publicDir, image);
  const webpPath = image.replace(rasterPattern, ".webp");
  const { size } = await stat(image);
  const { output, quality } = await encode(image);

  await writeFile(webpPath, output);
  before += size;
  after += output.length;

  const flag = output.length > targetBytes ? "  (still over 200 KB)" : "";
  console.log(`${relative}: ${kb(size)} -> ${kb(output.length)} @ q${quality}${flag}`);

  const name = path.basename(image);
  const references = sources.filter(({ text }) => text.includes(name));
  if (references.length === 0) {
    await unlink(image);
  } else {
    console.log(`  kept original, still referenced by:`);
    for (const { file } of references) {
      console.log(`    ${path.relative(root, file)}`);
    }
  }
}

console.log(`\nTotal: ${kb(before)} -> ${kb(after)}`);
