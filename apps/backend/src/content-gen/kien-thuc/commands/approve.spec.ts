import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { PageRef } from '@org/shared-contracts';
import { MalformedDraftError } from '../errors';
import { draftExists } from '../store/draft-store';
import { draftPath, type KienThucDirectories } from '../store/kien-thuc-paths';
import { SYLLABLES_PER_MINUTE } from '../text/syllable-count';
import { reviewedAtOf } from './reviewed-at';
import { approvePages } from './approve';

const FILLER = ['người', 'mới', 'đọc', 'trang', 'giúp', 'hiểu', 'thêm', 'phần', 'ghi', 'lại'];

function filler(count: number): string {
  return Array.from({ length: count }, (_, i) => FILLER[i % FILLER.length]).join(' ');
}

function thienCoDraft(extra = ''): unknown {
  return {
    summary:
      'Thiên Cơ là một chính tinh thường gặp, bài viết giúp người mới đọc hiểu nét chính của sao.',
    sections: [
      {
        heading: 'Tổng quan',
        paragraphs: [
          `Thiên Cơ thuộc hành Mộc. ${extra} ${filler(160)} Xem thêm [[bai/y-nghia-chinh-tinh|bài chính tinh]].`,
        ],
      },
      {
        heading: 'Vị trí',
        paragraphs: [
          `Thiên Cơ đứng trong chòm Tử Vi. ${filler(160)} Đối chiếu [[cung/menh|cung Mệnh]].`,
        ],
      },
      { heading: 'Ghi nhớ', paragraphs: [`Người mới nên đọc Thiên Cơ nhiều lần. ${filler(160)}`] },
    ],
    writtenBy: 'claude-code',
    writtenAt: '2026-11-15T00:00:00.000Z',
  };
}

const LESSON_SYLLABLES = 721;

function lessonDraft(): unknown {
  return {
    summary:
      'Bài này giúp người mới phân biệt phong thủy với tử vi và biết mỗi môn nói được điều gì.',
    sections: [
      {
        heading: 'Hai môn khác nhau',
        paragraphs: [`${filler(116)} Xem [[bai/tu-vi-la-gi|bài mở đầu]].`, filler(116)],
      },
      {
        heading: 'Mỗi môn nói gì',
        paragraphs: [`${filler(116)} Đọc thêm [[cung/quan-loc|cung Quan Lộc]].`, filler(116)],
      },
      {
        heading: 'Cách dùng cả hai',
        paragraphs: [`${filler(116)} Xem [[cung/menh|cung Mệnh]].`, filler(117)],
      },
    ],
    writtenBy: 'claude-code',
    writtenAt: '2026-11-15T00:00:00.000Z',
  };
}

const BROKEN_DRAFT = {
  summary: 'x',
  sections: [{ heading: 'M', paragraphs: ['ngắn'] }],
  writtenBy: 'claude-code',
  writtenAt: '2026-11-15T00:00:00.000Z',
};

describe('approvePages', () => {
  const now = new Date('2026-11-15T03:00:00Z');
  let directories: KienThucDirectories;

  beforeEach(async () => {
    const root = await mkdtemp(`${tmpdir()}/kien-thuc-approve-`);
    directories = { content: join(root, 'content'), drafts: join(root, 'drafts') };
  });

  afterEach(async () => {
    await rm(dirname(directories.content), { recursive: true, force: true });
  });

  async function writeDraft(ref: PageRef, value: unknown): Promise<void> {
    const path = draftPath(directories, ref);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(value), 'utf8');
  }

  async function readJson(relative: string): Promise<unknown> {
    return JSON.parse(await readFile(join(directories.content, relative), 'utf8'));
  }

  it('moves a valid draft into content and stamps it', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    const result = await approvePages(['sao/thien-co'], directories, now);

    expect(result.approved).toEqual(['sao/thien-co']);
    const file = (await readJson('sao/thien-co.json')) as Record<string, unknown>;
    expect(file.title).toBe('Sao Thiên Cơ');
    expect(file.aliases).toEqual([]);
    expect(file.reviewedAt).toBe(reviewedAtOf(now));
    expect(file.writtenBy).toBeUndefined();
    expect(file.writtenAt).toBeUndefined();
    expect(draftExists(directories, 'sao/thien-co')).toBe(false);

    const manifest = (await readJson('manifest.json')) as { entries: { slug: string }[] };
    expect(manifest.entries.some((entry) => entry.slug === 'thien-co')).toBe(true);
    const index = (await readJson('search-index.json')) as { slug: string }[];
    expect(index.some((item) => item.slug === 'thien-co')).toBe(true);
  });

  it('stamps a lesson with its âm tiết over 180, rounded up, as reading time', async () => {
    await writeDraft('bai/phong-thuy-va-tu-vi', lessonDraft());
    const result = await approvePages(['bai/phong-thuy-va-tu-vi'], directories, now);

    expect(result.rejected).toEqual([]);
    const file = (await readJson('bai/phong-thuy-va-tu-vi.json')) as Record<string, unknown>;
    expect(file.readingMinutes).toBe(Math.ceil(LESSON_SYLLABLES / SYLLABLES_PER_MINUTE));
  });

  it('refuses a draft that breaks a fact and leaves it in drafts', async () => {
    await writeDraft('sao/thien-co', thienCoDraft('Thiên Cơ miếu ở Dần.'));
    const result = await approvePages(['sao/thien-co'], directories, now);

    expect(result.approved).toEqual([]);
    expect(result.rejected[0].ref).toBe('sao/thien-co');
    expect(result.rejected[0].violations.some((v) => v.includes('Dần'))).toBe(true);
    await expect(readJson('sao/thien-co.json')).rejects.toBeDefined();
  });

  it('reports a ref with no draft and goes on', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    const result = await approvePages(['sao/thien-co', 'sao/thai-duong'], directories, now);

    expect(result.approved).toEqual(['sao/thien-co']);
    expect(result.rejected.map((rejection) => rejection.ref)).toEqual(['sao/thai-duong']);
  });

  it('replaces an approved page with its rewritten draft', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    await writeDraft('sao/thien-co', thienCoDraft('Thiên Cơ là sao của mưu trí.'));
    await approvePages(['sao/thien-co'], directories, now);

    const file = (await readJson('sao/thien-co.json')) as {
      sections: { paragraphs: string[] }[];
    };
    expect(file.sections[0].paragraphs[0]).toContain('Thiên Cơ là sao của mưu trí.');
    const manifest = (await readJson('manifest.json')) as { entries: { slug: string }[] };
    expect(manifest.entries.filter((entry) => entry.slug === 'thien-co')).toHaveLength(1);
  });

  it('approves the valid drafts of a batch even when one fails', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await writeDraft('cung/menh', BROKEN_DRAFT);
    const result = await approvePages(['sao/thien-co', 'cung/menh'], directories, now);

    expect(result.approved).toEqual(['sao/thien-co']);
    expect(result.rejected.map((rejection) => rejection.ref)).toEqual(['cung/menh']);
  });

  it('writes nothing when another draft cannot be read, and names that file', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await writeDraft('cung/menh', BROKEN_DRAFT);
    const brokenPath = draftPath(directories, 'sao/thai-duong');
    await mkdir(dirname(brokenPath), { recursive: true });
    await writeFile(brokenPath, '{ "summary": ', 'utf8');

    const approving = approvePages(['sao/thien-co', 'cung/menh'], directories, now);
    await expect(approving).rejects.toBeInstanceOf(MalformedDraftError);
    await expect(approving).rejects.toThrow(brokenPath);
    expect(existsSync(directories.content)).toBe(false);
    expect(draftExists(directories, 'sao/thien-co')).toBe(true);
    expect(draftExists(directories, 'cung/menh')).toBe(true);
  });

  it('rejects a malformed requested draft and approves the others', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await writeDraft('cung/menh', { summary: 'x', writtenBy: 'claude-code', writtenAt: 'now' });
    const result = await approvePages(['sao/thien-co', 'cung/menh'], directories, now);

    expect(result.approved).toEqual(['sao/thien-co']);
    expect(result.rejected.map((rejection) => rejection.ref)).toEqual(['cung/menh']);
    expect(result.rejected[0].violations[0]).toContain(draftPath(directories, 'cung/menh'));
  });
});
