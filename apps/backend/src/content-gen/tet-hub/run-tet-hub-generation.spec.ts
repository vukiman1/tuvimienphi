import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import type { ConGiapArticle, TuoiNamArticle } from '@org/shared-contracts';
import { tuoiNamSlug } from '@org/shared-tu-vi';
import {
  runTetHubGeneration,
  TetHubPageExistsError,
  UnknownTetHubPageError,
  type PagePlan,
} from './run-tet-hub-generation';
import { MalformedChapterError } from '../../api/luan-giai/luan-giai.errors';

const INTRO = { intro: ['Một.', 'Hai.'] };

function articleFor(slug: string): ConGiapArticle {
  return {
    slug,
    chi: 7,
    viewYear: 2027,
    tongQuan: [],
    tamTai: [],
    thaiTue: [],
    xongDat: [],
    model: 'test-model',
    generatedAt: '2026-11-07T00:00:00.000Z',
  };
}

const okPlan = (slug: string): PagePlan => ({
  slug,
  generate: async () => articleFor(slug),
});

describe('runTetHubGeneration', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'tet-hub-run-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  const options = { only: null, isForced: false };

  it('does not overwrite an existing hub.json', async () => {
    await writeFile(join(directory, 'hub.json'), '{"intro":["tay"]}\n');

    await runTetHubGeneration({
      directory,
      plans: [okPlan('tuoi-mui')],
      options,
      generateIntro: async () => INTRO,
      loadArticles: async () => [],
    });

    expect(await readFile(join(directory, 'hub.json'), 'utf8')).toBe('{"intro":["tay"]}\n');
  });

  it('keeps going and writes the manifest when the hub intro fails', async () => {
    const { failedSlugs } = await runTetHubGeneration({
      directory,
      plans: [okPlan('tuoi-mui')],
      options,
      generateIntro: async () => {
        throw new Error('intro rejected');
      },
      loadArticles: async () => [],
    });

    expect(failedSlugs).toEqual(['hub-intro']);
    const manifest = JSON.parse(await readFile(join(directory, 'manifest.json'), 'utf8'));
    expect(manifest.viewYear).toBe(2027);
    await expect(readFile(join(directory, 'tuoi-mui.json'), 'utf8')).resolves.toContain('tuoi-mui');
  });

  it('skips the hub intro when only one page is requested', async () => {
    const generateIntro = jest.fn(async () => INTRO);

    await runTetHubGeneration({
      directory,
      plans: [okPlan('tuoi-mui')],
      options: { only: 'tuoi-mui', isForced: false },
      generateIntro,
      loadArticles: async () => [],
    });

    expect(generateIntro).not.toHaveBeenCalled();
  });

  it('reports a failed page and still generates the others', async () => {
    const { failedSlugs } = await runTetHubGeneration({
      directory,
      plans: [
        {
          slug: 'tuoi-suu',
          generate: async () => {
            throw new Error('rejected');
          },
        },
        okPlan('tuoi-mui'),
      ],
      options,
      generateIntro: async () => INTRO,
      loadArticles: async () => [],
    });

    expect(failedSlugs).toEqual(['tuoi-suu']);
    await expect(readFile(join(directory, 'tuoi-mui.json'), 'utf8')).resolves.toBeDefined();
  });

  it('logs the parse error behind a malformed page', async () => {
    const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const parseError = new SyntaxError('Unexpected token } in JSON at position 7');

    await runTetHubGeneration({
      directory,
      plans: [
        {
          slug: 'tuoi-suu',
          generate: async () => {
            throw new MalformedChapterError('{"tay":}', { cause: parseError });
          },
        },
      ],
      options,
      generateIntro: async () => INTRO,
      loadArticles: async () => [],
    });

    const pageFailure = logError.mock.calls.find(([message]) =>
      String(message).startsWith('failed tuoi-suu'),
    );
    logError.mockRestore();
    expect(pageFailure?.[0]).toContain(`SyntaxError: ${parseError.message}`);
  });

  it('refuses to overwrite an existing page with --only alone', async () => {
    await writeFile(join(directory, 'tuoi-mui.json'), '{"tay":true}\n');

    await expect(
      runTetHubGeneration({
        directory,
        plans: [okPlan('tuoi-mui')],
        options: { only: 'tuoi-mui', isForced: false },
        generateIntro: async () => INTRO,
        loadArticles: async () => [],
      }),
    ).rejects.toThrow(TetHubPageExistsError);
    expect(await readFile(join(directory, 'tuoi-mui.json'), 'utf8')).toBe('{"tay":true}\n');
  });

  it('overwrites an existing page with --only and --force', async () => {
    await writeFile(join(directory, 'tuoi-mui.json'), '{"tay":true}\n');

    await runTetHubGeneration({
      directory,
      plans: [okPlan('tuoi-mui')],
      options: { only: 'tuoi-mui', isForced: true },
      generateIntro: async () => INTRO,
      loadArticles: async () => [],
    });

    expect(JSON.parse(await readFile(join(directory, 'tuoi-mui.json'), 'utf8'))).toEqual(
      articleFor('tuoi-mui'),
    );
  });

  it('rejects an --only slug that matches no page', async () => {
    await expect(
      runTetHubGeneration({
        directory,
        plans: [okPlan('tuoi-mui')],
        options: { only: 'tuoi-xyz', isForced: false },
        generateIntro: async () => INTRO,
        loadArticles: async () => [],
      }),
    ).rejects.toThrow(UnknownTetHubPageError);
  });

  it('reports similar neighbours while keeping the written pages', async () => {
    const paragraph =
      'Năm nay công việc ổn định, tài chính cần thận trọng, sức khỏe nên giữ nhịp đều.';
    const alike = (birthYear: number): TuoiNamArticle => ({
      slug: tuoiNamSlug(birthYear),
      birthYear,
      viewYear: 2027,
      tongQuan: [paragraph],
      saoHanNam: [],
      saoHanNu: [],
      menh: [],
      cuoiNha: [],
      loiKhuyen: [],
      faq: [],
      model: 'test-model',
      generatedAt: '2026-11-07T00:00:00.000Z',
    });

    const { similarPairs } = await runTetHubGeneration({
      directory,
      plans: [okPlan('tuoi-mui')],
      options,
      generateIntro: async () => INTRO,
      loadArticles: async () => [alike(1986), alike(1987)],
    });

    expect(similarPairs).toEqual([{ a: tuoiNamSlug(1986), b: tuoiNamSlug(1987), score: 1 }]);
    await expect(readFile(join(directory, 'tuoi-mui.json'), 'utf8')).resolves.toBeDefined();
    await expect(readFile(join(directory, 'manifest.json'), 'utf8')).resolves.toBeDefined();
  });
});
