import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { isMissingFileError } from '../store/json-files';

const SNAPSHOT_ENCODING = 'base64';

async function collect(
  directory: string,
  prefix: string,
  files: Map<string, string>,
): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = join(prefix, entry.name);
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(path, relative, files);
      continue;
    }
    files.set(relative, (await readFile(path)).toString(SNAPSHOT_ENCODING));
  }
}

export async function snapshotDirectory(directory: string): Promise<ReadonlyMap<string, string>> {
  const files = new Map<string, string>();
  try {
    await collect(directory, '', files);
  } catch (error) {
    if (isMissingFileError(error)) return files;
    throw error;
  }
  return files;
}
