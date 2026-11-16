import { UptimeState, UptimeStatus, upSince } from './uptime-state';
import { KeyValueStore, readUptimeState, writeUptimeState } from './uptime-store';

const FALLBACK = upSince(Date.UTC(2026, 10, 16, 0, 0));

class InMemoryStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async put(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }
}

describe('uptime store', () => {
  it('starts from the fallback when nothing was stored yet', async () => {
    await expect(readUptimeState(new InMemoryStore(), FALLBACK)).resolves.toEqual(FALLBACK);
  });

  it.each<UptimeState>([
    { status: UptimeStatus.Up, sinceMs: 1, consecutiveFailures: 1, failingSinceMs: 2 },
    { status: UptimeStatus.Down, sinceMs: 3 },
  ])('reads back the %o state it wrote', async (state) => {
    const store = new InMemoryStore();

    await writeUptimeState(store, state);

    await expect(readUptimeState(store, FALLBACK)).resolves.toEqual(state);
  });

  it('starts from the fallback when the stored value is unreadable', async () => {
    const store = new InMemoryStore();
    await store.put('api-readiness', '{"status":"sideways"}');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(readUptimeState(store, FALLBACK)).resolves.toEqual(FALLBACK);
  });
});
