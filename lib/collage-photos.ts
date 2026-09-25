import { readdirSync } from 'node:fs';
import path from 'node:path';

// Server-only: every webp tile in public/collage, so new pictures show up without
// editing a list. scripts/build-collage.mjs fills that folder from ../background.
export function collagePhotos() {
  try {
    return readdirSync(path.join(process.cwd(), 'public/collage'))
      .filter((file) => file.endsWith('.webp'))
      .map((file) => file.slice(0, -'.webp'.length))
      .sort();
  } catch {
    return [];
  }
}
