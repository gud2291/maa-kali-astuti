/* PNG → WebP for the design's product photos (F2).
   design/assets/*.png → public/images/*.webp (max 1600px on the long edge, quality 80).
   logo-emblem.png is skipped: the site uses the M.logo SVG (docs/DESIGN-INVENTORY.md §F.1).
   Run: node scripts/optimize-images.mjs */
import { readdirSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, DESIGN } from "./lib-design-env.mjs";

const SRC = path.join(DESIGN, "assets");
const OUT = path.join(ROOT, "public/images");
const SKIP = new Set(["logo-emblem.png"]);
const MAX = 1600;

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(SRC)) {
  if (!/\.png$/i.test(f) || SKIP.has(f)) continue;
  const src = path.join(SRC, f);
  const dest = path.join(OUT, f.replace(/\.png$/i, ".webp"));
  const info = await sharp(src)
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(dest);
  const kb = (n) => Math.round(n / 1024) + " KB";
  console.log(`${f.padEnd(24)} ${kb(statSync(src).size).padStart(8)} → ${path.basename(dest).padEnd(25)} ${info.width}×${info.height} ${kb(info.size)}`);
}
