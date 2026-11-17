import { readdir, readFile } from 'node:fs/promises';
import { isRecord } from '../../schema-guards';

export const JSON_SUFFIX = '.json';

const MISSING_FILE_CODE = 'ENOENT';

export function isMissingFileError(error: unknown): boolean {
  return isRecord(error) && error.code === MISSING_FILE_CODE;
}

export async function readTextIfPresent(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isMissingFileError(error)) return null;
    throw error;
  }
}

export async function listJsonSlugs(directory: string): Promise<readonly string[]> {
  let names: readonly string[];
  try {
    names = await readdir(directory);
  } catch (error) {
    if (isMissingFileError(error)) return [];
    throw error;
  }
  return names
    .filter((name) => name.endsWith(JSON_SUFFIX))
    .sort()
    .map((name) => name.slice(0, -JSON_SUFFIX.length));
}

export function parseJson(raw: string, malformed: (reason: string) => Error): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) throw malformed(error.message);
    throw error;
  }
}
