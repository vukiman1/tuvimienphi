import { AiCallPacer } from './ai-call-pacer';

const DELAY_MS = 30_000;

describe('AiCallPacer', () => {
  it('lets the first call through without a pause', async () => {
    const sleeps: number[] = [];
    const pacer = new AiCallPacer(DELAY_MS, async (ms) => void sleeps.push(ms));

    await pacer.beforeCall();

    expect(sleeps).toEqual([]);
  });

  it('pauses before every later call', async () => {
    const sleeps: number[] = [];
    const pacer = new AiCallPacer(DELAY_MS, async (ms) => void sleeps.push(ms));

    await pacer.beforeCall();
    await pacer.beforeCall();
    await pacer.beforeCall();

    expect(sleeps).toEqual([DELAY_MS, DELAY_MS]);
  });
});
