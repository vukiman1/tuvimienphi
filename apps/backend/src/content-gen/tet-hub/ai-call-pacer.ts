import { setTimeout as sleepMs } from 'node:timers/promises';

export type Sleep = (ms: number) => Promise<unknown>;

export class AiCallPacer {
  private hasWaited = false;

  constructor(
    private readonly delayMs: number,
    private readonly sleep: Sleep = sleepMs,
  ) {}

  readonly beforeCall = async (): Promise<void> => {
    if (this.hasWaited) await this.sleep(this.delayMs);
    this.hasWaited = true;
  };
}
