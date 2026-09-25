// Syncs the raw background screenshots into the optimized webp tiles used by the
// collage. Only new or changed pictures are converted, tiles whose source was
// removed are deleted, and byte-identical duplicates are skipped. The site reads
// public/collage directly, so there is no list to update.
//
//   node scripts/build-collage.mjs [sourceDir]
//
// sourceDir defaults to ../background (a sibling of this repo, not checked in).
// Runs automatically before `npm run dev` and `npm run build`; when the folder is
// missing (e.g. on a deploy) the committed tiles are left untouched.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile, rm, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const source = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(root, '../background');
const target = path.join(root, 'public/collage');

if (!existsSync(source)) {
  console.log(`collage: no ${source}, keeping the existing tiles`);
  process.exit(0);
}

function slug(file) {
  return path.parse(file).name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, 'img-$1');
}

const files = (await readdir(source)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file)).sort();
const seen = new Map();
const skipped = [];
for (const file of files) {
  const hash = createHash('sha256').update(await readFile(path.join(source, file))).digest('hex');
  if (seen.has(hash)) { skipped.push(`${file} == ${seen.get(hash)}`); continue; }
  seen.set(hash, file);
}

await mkdir(target, { recursive: true });
const wanted = new Map([...seen.values()].map((file) => [`${slug(file)}.webp`, file]));

let removed = 0;
for (const tile of await readdir(target)) {
  if (!wanted.has(tile)) { await rm(path.join(target, tile)); removed++; }
}

let written = 0;
let sharp;
for (const [tile, file] of wanted) {
  const input = path.join(source, file);
  const output = path.join(target, tile);
  if (existsSync(output) && (await stat(output)).mtimeMs >= (await stat(input)).mtimeMs) continue;
  sharp ??= (await import('sharp')).default;
  await sharp(input)
    .resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(output);
  written++;
}

console.log(`collage: ${wanted.size} tiles (${written} new or updated, ${removed} removed, ${skipped.length} duplicates skipped)`);
for (const line of skipped) console.log('  dup:', line);
