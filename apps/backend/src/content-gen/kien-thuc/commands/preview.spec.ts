import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ContentKind, EntryGroup, type EntryFile, type PageRef } from '@org/shared-contracts';
import { DRAFT_AUTHOR, type DraftFile } from '../store/draft-file';
import type { StoredDraft } from '../store/draft-store';
import type { ContentFiles } from '../store/content-store';
import type { KienThucDirectories } from '../store/kien-thuc-paths';
import { renderPreview, writePreview } from './preview';

const EMPTY_CONTENT: ContentFiles = { lessons: [], entries: [] };

function draft(ref: PageRef, paragraphs: readonly string[]): StoredDraft {
  const body: DraftFile = {
    summary: 'Tóm tắt.',
    sections: [{ heading: 'Mục', paragraphs }],
    writtenBy: DRAFT_AUTHOR,
    writtenAt: '2026-11-15T00:00:00.000Z',
  };
  return { ref, draft: body };
}

describe('renderPreview', () => {
  it('escapes prose', () => {
    const html = renderPreview([draft('sao/thien-co', ['Nguy <b>hiểm</b>.'])], EMPTY_CONTENT, []);
    expect(html).toContain('&lt;b&gt;');
  });

  it('shows the engine facts for a star draft with a dash for an empty cell', () => {
    const html = renderPreview([draft('sao/dia-kiep', ['Đoạn.'])], EMPTY_CONTENT, []);
    expect(html).toContain('—');
  });

  it('lists skipped claims before checked ones', () => {
    const html = renderPreview(
      [draft('sao/thien-co', ['Thiên Cơ và Thái Âm miếu ở Dần. Thiên Cơ thuộc hành Mộc.'])],
      EMPTY_CONTENT,
      [],
    );
    expect(html.indexOf('bỏ qua')).toBeLessThan(html.indexOf('đã soát'));
  });

  it('marks a link to an unpublished page', () => {
    const html = renderPreview(
      [draft('sao/thien-co', ['Xem [[bai/tu-vi-la-gi|bài]].'])],
      EMPTY_CONTENT,
      [],
    );
    expect(html).toContain('chưa có');
  });

  it('shows what changed against the approved version', () => {
    const published: EntryFile = {
      kind: ContentKind.Sao,
      group: EntryGroup.ChinhTinh,
      slug: 'thien-co',
      title: 'Sao Thiên Cơ',
      aliases: [],
      summary: 'Tóm tắt.',
      sections: [{ heading: 'Mục', paragraphs: ['Bản cũ.'] }],
      learnInLesson: 'y-nghia-chinh-tinh',
      reviewedAt: '2026-11-15',
    };
    const html = renderPreview(
      [draft('sao/thien-co', ['Bản mới.'])],
      { lessons: [], entries: [published] },
      [],
    );
    expect(html).toContain('Đã đổi');
  });
});

describe('writePreview', () => {
  let root: string;
  let directories: KienThucDirectories;

  beforeEach(async () => {
    root = await mkdtemp(`${tmpdir()}/kien-thuc-preview-`);
    directories = { content: join(root, 'content'), drafts: join(root, 'drafts') };
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('creates the folder of the preview file when it is missing', async () => {
    const file = join(root, 'tmp', 'kien-thuc-preview.html');
    await writePreview(directories, null, file);
    expect(await readFile(file, 'utf8')).toContain('<!doctype html>');
  });
});
