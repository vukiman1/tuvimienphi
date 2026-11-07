import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ConGiapArticle } from '@org/shared-contracts';
import {
  runTetHubGeneration,
  UnknownTetHubPageError,
  type PagePlan,
} from './run-tet-hub-generation';

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
    });

    expect(await readFile(join(directory, 'hub.json'), 'utf8')).toBe('{"intro":["tay"]}\n');
  });

  it('keeps going and writes the manifest when the hub intro fails', async () => {
    const failedSlugs = await runTetHubGeneration({
      directory,
      plans: [okPlan('tuoi-mui')],
      options,
      generateIntro: async () => {
        throw new Error('intro rejected');
      },
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
    });

    expect(generateIntro).not.toHaveBeenCalled();
  });

  it('reports a failed page and still generates the others', async () => {
    const failedSlugs = await runTetHubGeneration({
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
      options: { only: null, isForced: true },
      generateIntro: async () => INTRO,
    });

    expect(failedSlugs).toEqual(['tuoi-suu']);
    await expect(readFile(join(directory, 'tuoi-mui.json'), 'utf8')).resolves.toBeDefined();
  });

  it('rejects an --only slug that matches no page', async () => {
    await expect(
      runTetHubGeneration({
        directory,
        plans: [okPlan('tuoi-mui')],
        options: { only: 'tuoi-xyz', isForced: false },
        generateIntro: async () => INTRO,
      }),
    ).rejects.toThrow(UnknownTetHubPageError);
  });
});
