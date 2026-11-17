import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const JSON_INDENT = 2;
const TEMP_FILE_SUFFIX = 'tmp';

export async function writeJsonFile(
  directory: string,
  fileName: string,
  value: unknown,
): Promise<void> {
  await mkdir(directory, { recursive: true });
  const target = join(directory, fileName);
  const temp = join(directory, `.${fileName}.${randomUUID()}.${TEMP_FILE_SUFFIX}`);
  try {
    await writeFile(temp, `${JSON.stringify(value, null, JSON_INDENT)}\n`, 'utf8');
    await rename(temp, target);
  } catch (error) {
    await rm(temp, { force: true });
    throw error;
  }
}
