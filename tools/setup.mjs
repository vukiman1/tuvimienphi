#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';

const ENV_FILES = [
  { example: 'apps/backend/.env.example', target: 'apps/backend/.env' },
  { example: 'apps/frontend/.env.example', target: 'apps/frontend/.env' },
];

for (const { example, target } of ENV_FILES) {
  if (existsSync(target)) {
    console.log(`✓ ${target} already exists, skipping`);
  } else {
    copyFileSync(example, target);
    console.log(`✓ created ${target} from ${example}`);
  }
}

run('docker', ['compose', 'up', '-d', '--wait', 'db', 'redis']);
run('node', ['tools/typeorm-migration.mjs', 'run']);

console.log('\nSetup complete. Start dev with: pnpm dev');

function run(command, args) {
  console.log(`\n$ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`Command failed: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
}
