import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import type { PageRef } from '@org/shared-contracts';
import { MalformedDraftError, MissingDraftError } from '../errors';
import { readAllDrafts, readDraft } from './draft-store';
import { draftPath, type KienThucDirectories } from './kien-thuc-paths';

describe('draft store', () => {
  let directories: KienThucDirectories;

  beforeEach(async () => {
    const root = await mkdtemp(`${tmpdir()}/kien-thuc-`);
    directories = { content: `${root}/content`, drafts: `${root}/drafts` };
  });

  afterEach(async () => {
    await rm(dirname(directories.drafts), { recursive: true, force: true });
  });

  async function writeDraft(ref: PageRef, value: unknown): Promise<void> {
    const path = draftPath(directories, ref);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(value), 'utf8');
  }

  function draftOf(paragraphs: readonly string[]): unknown {
    return {
      summary: 'Tóm tắt.',
      sections: [{ heading: 'Mục', paragraphs }],
      writtenBy: 'claude-code',
      writtenAt: '2026-11-15T00:00:00.000Z',
    };
  }

  it('reads a draft by ref from its kind folder', async () => {
    await writeDraft('sao/thien-co', draftOf(['Đoạn.']));
    expect((await readDraft(directories, 'sao/thien-co')).summary).toBe('Tóm tắt.');
  });

  it('lists every draft with its ref', async () => {
    await writeDraft('sao/thien-co', draftOf(['Đoạn.']));
    await writeDraft('cung/menh', draftOf(['Đoạn.']));
    const refs = (await readAllDrafts(directories)).map((stored) => stored.ref);
    expect(refs).toEqual(expect.arrayContaining(['sao/thien-co', 'cung/menh']));
  });

  it('throws MissingDraftError for a ref with no file', async () => {
    await expect(readDraft(directories, 'sao/thien-co')).rejects.toBeInstanceOf(MissingDraftError);
  });

  it('throws MalformedDraftError naming the file for a draft without sections', async () => {
    await writeDraft('sao/thien-co', { summary: 'x', writtenBy: 'claude-code', writtenAt: 'now' });
    await expect(readDraft(directories, 'sao/thien-co')).rejects.toBeInstanceOf(
      MalformedDraftError,
    );
  });

  it('reduces a repeated link on read', async () => {
    await writeDraft(
      'sao/thien-co',
      draftOf(['Xem [[cung/menh|Mệnh]] và [[cung/menh|Mệnh]] lần nữa.']),
    );
    const draft = await readDraft(directories, 'sao/thien-co');
    expect(draft.sections[0].paragraphs[0]).toBe('Xem [[cung/menh|Mệnh]] và Mệnh lần nữa.');
  });
});
