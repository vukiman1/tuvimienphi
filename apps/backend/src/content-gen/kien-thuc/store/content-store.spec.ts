import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MalformedContentFileError } from '../errors';
import { lessonFile, THIEN_CO_ENTRY } from './content-fixtures';
import { readContent } from './content-store';

describe('content store', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(`${tmpdir()}/kien-thuc-content-`);
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  async function write(folder: string, name: string, value: unknown): Promise<void> {
    await mkdir(join(directory, folder), { recursive: true });
    await writeFile(join(directory, folder, name), JSON.stringify(value), 'utf8');
  }

  it('reads lessons and entries by folder', async () => {
    await write('bai', 'tu-vi-la-gi.json', lessonFile('tu-vi-la-gi', 1, 1, 'Tử vi là gì'));
    await write('sao', 'thien-co.json', THIEN_CO_ENTRY);
    const content = await readContent(directory);
    expect(content.lessons.map((lesson) => lesson.slug)).toEqual(['tu-vi-la-gi']);
    expect(content.entries.map((entry) => entry.slug)).toEqual(['thien-co']);
  });

  it('throws MalformedContentFileError for a lesson without reviewedAt', async () => {
    const { reviewedAt, ...broken } = lessonFile('tu-vi-la-gi', 1, 1, 'Tử vi là gì');
    void reviewedAt;
    await write('bai', 'tu-vi-la-gi.json', broken);
    await expect(readContent(directory)).rejects.toBeInstanceOf(MalformedContentFileError);
  });
});
