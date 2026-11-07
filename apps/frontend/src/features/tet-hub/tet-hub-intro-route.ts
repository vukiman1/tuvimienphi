import type { TetHubIntro } from '@org/shared-contracts';

export type TetHubIntroLoader = () => Promise<TetHubIntro | undefined>;

const EMPTY_INTRO: TetHubIntro = { intro: [] };

export async function loadTetHubIntro(loadIntro: TetHubIntroLoader): Promise<TetHubIntro> {
  return (await loadIntro()) ?? EMPTY_INTRO;
}
