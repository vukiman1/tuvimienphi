import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { PageRef } from '@org/shared-contracts';
import { MalformedContentFileError } from '../errors';
import { draftPath, type KienThucDirectories } from '../store/kien-thuc-paths';
import { UNPLANNED_PAGE_VIOLATION } from '../validate/validate-page';
import { approvePages } from './approve';
import {
  CheckedSource,
  checkKienThucContent,
  checkOnePage,
  hasCheckFailures,
  renderPageCheck,
} from './check';
import { snapshotDirectory } from './directory-snapshot';

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

describe('check', () => {
  const now = new Date('2026-11-15T03:00:00Z');
  let directories: KienThucDirectories;

  beforeEach(async () => {
    const root = await mkdtemp(`${tmpdir()}/kien-thuc-check-`);
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

  it('checks the content file when the page has no draft', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    const check = await checkOnePage('sao/thien-co', directories);
    expect(check.source).toBe(CheckedSource.Content);
    expect(check.validation.violations).toEqual([]);
  });

  it('checks one draft against every other page', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    await writeDraft('sao/thai-duong', thienCoDraft());
    const check = await checkOnePage('sao/thai-duong', directories);
    expect(check.validation.violations.some((v) => v.includes('sao/thien-co'))).toBe(true);
  });

  it('passes a clean folder and leaves content untouched', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    const before = await snapshotDirectory(directories.content);

    const clean = await checkKienThucContent(directories);
    await checkOnePage('sao/thien-co', directories);

    expect(hasCheckFailures(clean)).toBe(false);
    expect(await snapshotDirectory(directories.content)).toEqual(before);
    expect(before.size).toBe(3);
  });

  it('reports similar pairs across drafts and content', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    await writeDraft('sao/thai-duong', thienCoDraft());

    const report = await checkKienThucContent(directories);
    expect(report.similarPairs.map((pair) => [pair.a, pair.b])).toEqual([
      ['sao/thien-co', 'sao/thai-duong'],
    ]);
  });

  it('reports a content file that breaks a fact', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    const path = join(directories.content, 'sao/thien-co.json');
    const file = JSON.parse(await readFile(path, 'utf8')) as {
      sections: { heading: string; paragraphs: string[] }[];
    };
    file.sections[0].paragraphs[0] = `Thiên Cơ miếu ở Dần. ${file.sections[0].paragraphs[0]}`;
    await writeFile(path, JSON.stringify(file), 'utf8');

    const report = await checkKienThucContent(directories);
    const page = report.pages.find((item) => item.ref === 'sao/thien-co');
    expect(page?.source).toBe(CheckedSource.Content);
    expect(page?.validation.violations.some((v) => v.includes('Dần'))).toBe(true);
    expect(hasCheckFailures(report)).toBe(true);
  });

  it('does not compare a revision draft with its own approved page', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    await writeDraft('sao/thien-co', thienCoDraft('Thiên Cơ là sao của mưu trí.'));

    const report = await checkKienThucContent(directories);
    expect(report.similarPairs).toEqual([]);
    expect(hasCheckFailures(report)).toBe(false);
  });

  it('reports a content title that no longer equals the plan and a stale manifest', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    const path = join(directories.content, 'sao/thien-co.json');
    const file = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
    await writeFile(path, JSON.stringify({ ...file, title: 'Tên sai' }), 'utf8');
    await writeFile(
      join(directories.content, 'manifest.json'),
      JSON.stringify({ steps: [], entries: [] }),
      'utf8',
    );

    const report = await checkKienThucContent(directories);
    expect(report.planDrift.some((drift) => drift.fields.includes('title'))).toBe(true);
    expect(report.staleIndexes).toContain('manifest.json');
  });

  it('refuses a manifest that is not JSON instead of calling it absent', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    const manifestPath = join(directories.content, 'manifest.json');
    await writeFile(manifestPath, '{ "steps": ', 'utf8');

    const checking = checkKienThucContent(directories);
    await expect(checking).rejects.toBeInstanceOf(MalformedContentFileError);
    await expect(checking).rejects.toThrow(manifestPath);
  });

  it('does not flag missing indexes when nothing is approved', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    const report = await checkKienThucContent(directories);
    expect(report.staleIndexes).toEqual([]);
    expect(report.pages.every((page) => page.validation.violations.length === 0)).toBe(true);
  });

  it('reports a draft the plan does not know and checks the others', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await writeDraft('sao/sao-khong-co', thienCoDraft());

    const report = await checkKienThucContent(directories);
    const unplanned = report.pages.find((page) => page.ref === 'sao/sao-khong-co');
    expect(unplanned?.validation.violations).toEqual([UNPLANNED_PAGE_VIOLATION]);
    expect(report.pages.map((page) => page.ref)).toContain('sao/thien-co');
  });

  it('prints skipped claims after the violations and before the checked ones', async () => {
    await writeDraft(
      'sao/thien-co',
      thienCoDraft('Thiên Cơ miếu ở Dần. Thiên Cơ và Thái Âm miếu ở Dần.'),
    );
    const output = renderPageCheck(await checkOnePage('sao/thien-co', directories));

    const violations = output.indexOf('## Vi phạm');
    const firstSkipped = output.indexOf('[bỏ qua]');
    const firstChecked = output.indexOf('[đã soát]');
    expect(violations).toBeGreaterThanOrEqual(0);
    expect(firstSkipped).toBeGreaterThan(violations);
    expect(firstChecked).toBeGreaterThan(firstSkipped);
    expect(output.lastIndexOf('[bỏ qua]')).toBeLessThan(firstChecked);
  });
});
