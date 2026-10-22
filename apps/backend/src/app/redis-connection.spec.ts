import { producerConnection, workerConnection, type RedisSettings } from './redis-connection';

const REDIS: RedisSettings = {
  cluster: false,
  host: 'redis',
  port: 6379,
  db: 0,
  password: 'secret',
  tls: false,
};

describe('producerConnection', () => {
  it('fails fast instead of queueing commands while Redis is unreachable', () => {
    expect(producerConnection(REDIS)).toMatchObject({ enableOfflineQueue: false });
  });
});

describe('workerConnection', () => {
  it('lets blocking worker commands wait out a reconnect', () => {
    const connection = workerConnection(REDIS);

    expect(connection).toMatchObject({ maxRetriesPerRequest: null });
    expect(connection).not.toHaveProperty('enableOfflineQueue', false);
  });
});

describe('both connections', () => {
  it('point at the configured Redis', () => {
    expect(producerConnection(REDIS)).toMatchObject({
      host: 'redis',
      port: 6379,
      db: 0,
      password: 'secret',
    });
  });

  it('turn TLS on only when the config asks for it', () => {
    expect(workerConnection({ ...REDIS, tls: true })).toMatchObject({ tls: {} });
    expect(workerConnection(REDIS)).not.toHaveProperty('tls');
  });
});
