import type { TetHubIntro } from '@org/shared-contracts';
import fixture from './__fixtures__/hub.json';
import { loadTetHubIntro } from './tet-hub-intro-route';

const INTRO: TetHubIntro = fixture;

describe('loadTetHubIntro', () => {
  it('returns the intro from hub.json', async () => {
    expect(await loadTetHubIntro(() => Promise.resolve(INTRO))).toEqual(INTRO);
  });

  it('returns an empty intro when hub.json does not exist', async () => {
    expect(await loadTetHubIntro(() => Promise.resolve(undefined))).toEqual({ intro: [] });
  });
});
