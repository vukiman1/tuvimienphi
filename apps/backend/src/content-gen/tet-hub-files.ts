import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const MANIFEST_FILE = 'manifest.json';
export const INTRO_FILE = 'hub.json';

export function pageFileName(slug: string): string {
  return `${slug}.json`;
}

export function pageExists(directory: string, slug: string): boolean {
  return existsSync(join(directory, pageFileName(slug)));
}

export function introExists(directory: string): boolean {
  return existsSync(join(directory, INTRO_FILE));
}
