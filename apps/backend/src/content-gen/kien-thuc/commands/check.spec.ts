import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { PageRef } from '@org/shared-contracts';
import { draftPath, type KienThucDirectories } from '../store/kien-thuc-paths';
import { checkedClaim, skippedClaim } from '../validate/facts/fact-subject';
import { approvePages } from './approve';
import {
  CheckedSource,
  checkKienThucContent,
  checkOnePage,
  renderPageCheck,
  type PageCheck,
} from './check';

const FILLER = ['người', 'mới', 'đọc', 'trang', 'giúp', 'hiểu', 'thêm', 'phần', 'ghi', 'lại'];

function filler(count: number): string {
  return Array.from({ length: count }, (_, i) => FILLER[i % FILLER.length]).join(' ');
}

function thienCoDraft(): unknown {
  return {
    summary:
      'Thiên Cơ là một chính tinh thường gặp, bài viết giúp người mới đọc hiểu nét chính của sao.',
    sections: [
      {
        heading: 'Tổng quan',
        paragraphs: [
          `Thiên Cơ thuộc hành Mộc. ${filler(160)} Xem thêm [[bai/y-nghia-chinh-tinh|bài chính tinh]].`,
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

  it('reports similar pairs and leaves a clean folder passing', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    await approvePages(['sao/thien-co'], directories, now);
    const before = await readFile(join(directories.content, 'sao/thien-co.json'), 'utf8');

    const clean = await checkKienThucContent(directories);
    expect(clean.pages.every((page) => page.validation.violations.length === 0)).toBe(true);
    expect(clean.staleIndexes).toEqual([]);
    expect(clean.planDrift).toEqual([]);
    expect(await readFile(join(directories.content, 'sao/thien-co.json'), 'utf8')).toBe(before);

    await writeDraft('sao/thai-duong', thienCoDraft());
    const report = await checkKienThucContent(directories);
    expect(report.similarPairs.length).toBeGreaterThan(0);
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

  it('does not flag missing indexes when nothing is approved', async () => {
    await writeDraft('sao/thien-co', thienCoDraft());
    const report = await checkKienThucContent(directories);
    expect(report.staleIndexes).toEqual([]);
    expect(report.pages.every((page) => page.validation.violations.length === 0)).toBe(true);
  });

  it('prints skipped claims after the violations', () => {
    const check: PageCheck = {
      ref: 'sao/thien-co',
      source: CheckedSource.Draft,
      validation: {
        violations: ['một vi phạm'],
        claims: [skippedClaim('mệnh đề A', 'lý do'), checkedClaim('mệnh đề B')],
        warnings: [],
      },
      neighbour: null,
    };
    const output = renderPageCheck(check);
    expect(output.indexOf('## Vi phạm')).toBeLessThan(output.indexOf('## Mệnh đề'));
  });
});
