import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { KIEN_THUC_CONTENT_DIRECTORY } from '../store/kien-thuc-paths';
import { UNPLANNED_PAGE_VIOLATION } from '../validate/validate-page';
import { approvedContentFactViolations } from './approved-content';

const WORKSPACE_ROOT = resolve(__dirname, '../../../../../..');
const CONTENT_DIRECTORY = join(WORKSPACE_ROOT, KIEN_THUC_CONTENT_DIRECTORY);

describe('approvedContentFactViolations', () => {
  it('reads the content folder of the frontend kiến thức feature', () => {
    expect(existsSync(dirname(CONTENT_DIRECTORY))).toBe(true);
  });

  it('finds no fact violation in approved content', async () => {
    expect(await approvedContentFactViolations(CONTENT_DIRECTORY)).toEqual([]);
  });

  it('fails on a content file that contradicts the engine', async () => {
    const directory = await mkdtemp(`${tmpdir()}/kien-thuc-approved-`);
    await mkdir(join(directory, 'sao'), { recursive: true });
    await writeFile(
      join(directory, 'sao', 'thien-co.json'),
      JSON.stringify({
        kind: 'sao',
        group: 'chinh-tinh',
        slug: 'thien-co',
        title: 'Sao Thiên Cơ',
        aliases: [],
        summary: 'Tóm tắt.',
        sections: [{ heading: 'Mục', paragraphs: ['Thiên Cơ miếu ở Dần.'] }],
        learnInLesson: 'y-nghia-chinh-tinh',
        reviewedAt: '2026-11-15',
      }),
      'utf8',
    );

    const violations = await approvedContentFactViolations(directory);
    await rm(directory, { recursive: true, force: true });
    expect(violations.some((item) => item.violations.some((v) => v.includes('Dần')))).toBe(true);
  });

  it('reports a content file the plan does not know', async () => {
    const directory = await mkdtemp(`${tmpdir()}/kien-thuc-approved-`);
    await mkdir(join(directory, 'sao'), { recursive: true });
    await writeFile(
      join(directory, 'sao', 'sao-khong-co.json'),
      JSON.stringify({
        kind: 'sao',
        group: 'chinh-tinh',
        slug: 'sao-khong-co',
        title: 'Sao không có',
        aliases: [],
        summary: 'Tóm tắt.',
        sections: [{ heading: 'Mục', paragraphs: ['Một đoạn.'] }],
        learnInLesson: 'y-nghia-chinh-tinh',
        reviewedAt: '2026-11-15',
      }),
      'utf8',
    );

    const violations = await approvedContentFactViolations(directory);
    await rm(directory, { recursive: true, force: true });
    expect(violations).toEqual([
      { ref: 'sao/sao-khong-co', violations: [UNPLANNED_PAGE_VIOLATION] },
    ]);
  });
});
