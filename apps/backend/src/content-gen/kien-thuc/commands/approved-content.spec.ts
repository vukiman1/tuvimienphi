import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { KIEN_THUC_CONTENT_DIRECTORY } from '../store/kien-thuc-paths';
import { approvedContentFactViolations } from './approved-content';

const WORKSPACE_ROOT = resolve(__dirname, '../../../../../..');

describe('approvedContentFactViolations', () => {
  it('finds no fact violation in approved content', async () => {
    const violations = await approvedContentFactViolations(
      join(WORKSPACE_ROOT, KIEN_THUC_CONTENT_DIRECTORY),
    );
    expect(violations).toEqual([]);
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
});
