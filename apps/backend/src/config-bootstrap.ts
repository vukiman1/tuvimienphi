import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import customEnvironmentVariablesYml from '../config/custom-environment-variables.yml';
import defaultYml from '../config/default.yml';
import productionYml from '../config/production.yml';

/**
 * Serverless bundles ship as a single file: the YAML config directory never reaches the function,
 * and node-config resolves its paths at runtime so no file tracer can pull them in either. The
 * contents are inlined at build time and written to the one writable path a function has.
 *
 * Must be imported before anything that reads configuration.
 */
const CONFIG_DIR = '/tmp/backend-config';

const FILES: ReadonlyArray<readonly [string, string]> = [
  ['default.yml', defaultYml],
  ['production.yml', productionYml],
  ['custom-environment-variables.yml', customEnvironmentVariablesYml],
];

mkdirSync(CONFIG_DIR, { recursive: true });
for (const [name, contents] of FILES) {
  writeFileSync(join(CONFIG_DIR, name), contents);
}

process.env.NODE_CONFIG_DIR = CONFIG_DIR;

// TEMPORARY: prints which configuration variables the runtime can actually see, and nothing about
// their contents. Remove once the deployed function starts.
const WATCHED =
  /^(NODE_ENV|APP_URL|CORS_ORIGINS|DATABASE_URL|REDIS_URL|DB_|REDIS_|JWT_|SECRET_KEY|QUEUE_BOARD_)/;
console.log('[env-probe] NODE_ENV =', JSON.stringify(process.env.NODE_ENV));
console.log(
  '[env-probe] CONFIG_DIR =',
  CONFIG_DIR,
  '| files =',
  FILES.map(([name]) => name).join(','),
);
console.log(
  '[env-probe] present =',
  Object.keys(process.env)
    .filter((key) => WATCHED.test(key))
    .sort()
    .join(',') || '(none)',
);
