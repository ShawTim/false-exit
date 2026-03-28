#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const guards = [
  ['node', ['scripts/validate-story.mjs']],
  ['node', ['scripts/check-doc-answer-consistency.mjs']],
];

for (const [command, args] of guards) {
  const pretty = `${command} ${args.join(' ')}`;
  console.log(`[acceptance] running: ${pretty}`);

  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error(`[acceptance] FAILED at: ${pretty}`);
    process.exit(result.status ?? 1);
  }
}

console.log('[acceptance] OK: content lint + docs answer consistency passed');
