import fsPromises, { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeJsonFile } from './write-json-file';

describe('writeJsonFile', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'write-json-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('pretty-prints with a trailing newline', async () => {
    const value = { a: 1, b: ['x', 'y'] };

    await writeJsonFile(dir, 'value.json', value);

    const raw = await readFile(join(dir, 'value.json'), 'utf8');
    expect(raw).toBe(`${JSON.stringify(value, null, 2)}\n`);
  });

  it('creates the output directory when it does not exist', async () => {
    const nested = join(dir, 'a', 'b');

    await writeJsonFile(nested, 'value.json', { ok: true });

    expect(JSON.parse(await readFile(join(nested, 'value.json'), 'utf8'))).toEqual({ ok: true });
  });

  it('keeps the existing file whole when a write stops halfway', async () => {
    await writeJsonFile(dir, 'value.json', { ok: true });
    const before = await readFile(join(dir, 'value.json'), 'utf8');
    const realWriteFile = fsPromises.writeFile;
    const interrupted = jest
      .spyOn(fsPromises, 'writeFile')
      .mockImplementation(async (path, data) => {
        await realWriteFile(path, String(data).slice(0, 10));
        throw new Error('write interrupted');
      });

    await expect(writeJsonFile(dir, 'value.json', { ok: false })).rejects.toThrow(
      'write interrupted',
    );
    interrupted.mockRestore();

    expect(await readFile(join(dir, 'value.json'), 'utf8')).toBe(before);
    expect(await readdir(dir)).toEqual(['value.json']);
  });
});
