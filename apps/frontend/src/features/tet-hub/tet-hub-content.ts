import type { ConGiapArticle, TetHubIntro, TuoiNamArticle } from '@org/shared-contracts';

type ContentLoaders<T> = Readonly<Record<string, () => Promise<T>>>;

const TUOI_NAM_LOADERS: ContentLoaders<TuoiNamArticle> = import.meta.glob<TuoiNamArticle>(
  './content/2027/tuoi-*-[0-9][0-9][0-9][0-9].json',
  { import: 'default' },
);

const CON_GIAP_LOADERS: ContentLoaders<ConGiapArticle> = import.meta.glob<ConGiapArticle>(
  ['./content/2027/tuoi-*.json', '!./content/2027/tuoi-*-[0-9][0-9][0-9][0-9].json'],
  { import: 'default' },
);

const HUB_INTRO_LOADERS: ContentLoaders<TetHubIntro> = import.meta.glob<TetHubIntro>(
  './content/2027/hub.json',
  { import: 'default' },
);

function contentKey(slug: string): string {
  return `./content/2027/${slug}.json`;
}

async function loadContent<T>(loaders: ContentLoaders<T>, slug: string): Promise<T | undefined> {
  const load = loaders[contentKey(slug)];
  return load ? load() : undefined;
}

export function loadTuoiNamArticle(slug: string): Promise<TuoiNamArticle | undefined> {
  return loadContent(TUOI_NAM_LOADERS, slug);
}

export function loadConGiapArticle(slug: string): Promise<ConGiapArticle | undefined> {
  return loadContent(CON_GIAP_LOADERS, slug);
}

export function loadHubIntro(): Promise<TetHubIntro | undefined> {
  return loadContent(HUB_INTRO_LOADERS, 'hub');
}
