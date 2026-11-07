import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TuoiNamArticle } from '@org/shared-contracts';
import { conGiapSlug, tuoiNamSlug } from '@org/shared-tu-vi';
import { MalformedTuoiNamArticleError, readTuoiNamArticles } from './tet-hub-reader';

function articleOf(birthYear: number): TuoiNamArticle {
  return {
    slug: tuoiNamSlug(birthYear),
    birthYear,
    viewYear: 2027,
    tongQuan: ['Một đoạn.'],
    saoHanNam: [],
    saoHanNu: [],
    menh: [],
    cuoiNha: [],
    loiKhuyen: [],
    faq: [{ question: 'Hỏi?', answer: 'Đáp.' }],
    model: 'test-model',
    generatedAt: '2026-11-07T00:00:00.000Z',
  };
}

describe('readTuoiNamArticles', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'tet-hub-read-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  const writePage = (slug: string, content: unknown): Promise<void> =>
    writeFile(join(directory, `${slug}.json`), JSON.stringify(content));

  it('loads the year pages that exist and skips absent years', async () => {
    await writePage(tuoiNamSlug(1986), articleOf(1986));
    await writePage(tuoiNamSlug(1987), articleOf(1987));

    const articles = await readTuoiNamArticles(directory);

    expect(articles.map((article) => article.birthYear)).toEqual([1986, 1987]);
  });

  it('never reads the hub intro, the manifest or a con giáp page', async () => {
    await writeFile(join(directory, 'hub.json'), 'not json');
    await writeFile(join(directory, 'manifest.json'), 'not json');
    await writeFile(join(directory, `${conGiapSlug(7)}.json`), 'not json');
    await writePage(tuoiNamSlug(1986), articleOf(1986));

    await expect(readTuoiNamArticles(directory)).resolves.toHaveLength(1);
  });

  it('names the file when a page is missing a field', async () => {
    await writePage(tuoiNamSlug(1986), { ...articleOf(1986), model: undefined });

    await expect(readTuoiNamArticles(directory)).rejects.toThrow(
      new MalformedTuoiNamArticleError(`${tuoiNamSlug(1986)}.json`),
    );
  });

  it('rejects a page whose slug belongs to another year', async () => {
    await writePage(tuoiNamSlug(1986), articleOf(1987));

    await expect(readTuoiNamArticles(directory)).rejects.toBeInstanceOf(
      MalformedTuoiNamArticleError,
    );
  });

  it('keeps the parse failure as the cause of a file that is not JSON', async () => {
    await writeFile(join(directory, `${tuoiNamSlug(1986)}.json`), '{broken');

    const error: unknown = await readTuoiNamArticles(directory).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MalformedTuoiNamArticleError);
    expect((error as MalformedTuoiNamArticleError).cause).toBeInstanceOf(SyntaxError);
    expect((error as MalformedTuoiNamArticleError).fileName).toBe(`${tuoiNamSlug(1986)}.json`);
  });
});
