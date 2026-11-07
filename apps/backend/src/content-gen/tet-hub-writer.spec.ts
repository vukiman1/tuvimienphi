import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ConGiapArticle, TetHubManifest, TuoiNamArticle } from '@org/shared-contracts';
import { writeTetHubIntro, writeTetHubManifest, writeTetHubPage } from './tet-hub-writer';

const tuoiNamArticle: TuoiNamArticle = {
  slug: 'tuoi-binh-dan-1986',
  birthYear: 1986,
  viewYear: 2027,
  tongQuan: ['Một.', 'Hai.'],
  saoHanNam: ['Một.', 'Hai.'],
  saoHanNu: ['Một.', 'Hai.'],
  menh: ['Một.', 'Hai.'],
  cuoiNha: ['Một.', 'Hai.'],
  loiKhuyen: ['Một.', 'Hai.'],
  faq: [{ question: 'Hỏi?', answer: 'Đáp.' }],
  model: 'test-model',
  generatedAt: '2026-11-07T00:00:00.000Z',
};

const conGiapArticle: ConGiapArticle = {
  slug: 'tuoi-mui',
  chi: 7,
  viewYear: 2027,
  tongQuan: ['Một.', 'Hai.'],
  tamTai: ['Một.', 'Hai.'],
  thaiTue: ['Một.', 'Hai.'],
  xongDat: ['Một.', 'Hai.'],
  model: 'test-model',
  generatedAt: '2026-11-07T00:00:00.000Z',
};

describe('tet hub writer', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'tet-hub-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes one JSON file per page and a sorted manifest', async () => {
    const manifest: TetHubManifest = {
      viewYear: 2027,
      conGiap: ['tuoi-tuat', 'tuoi-mui'],
      tuoiNam: ['tuoi-binh-dan-1986', 'tuoi-at-suu-1985'],
    };

    await writeTetHubPage(dir, tuoiNamArticle);
    await writeTetHubPage(dir, conGiapArticle);
    await writeTetHubManifest(dir, manifest);

    const read = async (name: string): Promise<unknown> =>
      JSON.parse(await readFile(join(dir, name), 'utf8'));
    expect(await read('tuoi-binh-dan-1986.json')).toEqual(tuoiNamArticle);
    expect(await read('tuoi-mui.json')).toEqual(conGiapArticle);
    expect(await read('manifest.json')).toEqual({
      viewYear: 2027,
      conGiap: ['tuoi-mui', 'tuoi-tuat'],
      tuoiNam: ['tuoi-at-suu-1985', 'tuoi-binh-dan-1986'],
    });
  });

  it('pretty-prints with a trailing newline', async () => {
    await writeTetHubPage(dir, conGiapArticle);

    const raw = await readFile(join(dir, 'tuoi-mui.json'), 'utf8');
    expect(raw).toBe(`${JSON.stringify(conGiapArticle, null, 2)}\n`);
  });

  it('writes the hub intro as hub.json', async () => {
    await writeTetHubIntro(dir, { intro: ['Một.', 'Hai.'] });

    expect(JSON.parse(await readFile(join(dir, 'hub.json'), 'utf8'))).toEqual({
      intro: ['Một.', 'Hai.'],
    });
  });

  it('creates the output directory when it does not exist', async () => {
    const nested = join(dir, '2027');

    await writeTetHubPage(nested, conGiapArticle);

    expect(JSON.parse(await readFile(join(nested, 'tuoi-mui.json'), 'utf8'))).toEqual(
      conGiapArticle,
    );
  });
});
