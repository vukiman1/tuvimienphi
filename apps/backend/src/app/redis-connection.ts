import configuration from '@org/backend-config';
import type { ConnectionOptions } from 'bullmq';

export type RedisSettings = ReturnType<typeof configuration>['redis'];

function baseConnection(redis: RedisSettings): ConnectionOptions {
  return {
    host: redis.host,
    port: redis.port,
    db: redis.db,
    password: redis.password || undefined,
    ...(redis.tls ? { tls: {} } : {}),
  };
}

export function producerConnection(redis: RedisSettings): ConnectionOptions {
  return { ...baseConnection(redis), enableOfflineQueue: false };
}

export function workerConnection(redis: RedisSettings): ConnectionOptions {
  return { ...baseConnection(redis), maxRetriesPerRequest: null };
}
