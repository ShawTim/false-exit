#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const smokePath = resolve(repoRoot, 'tests/smoke.md');

const REQUIRED_ITEMS = [
  'Run `python3 -m http.server 8080` from repo root.',
  'In another shell, run fixed acceptance entrypoint: `node scripts/run-acceptance-guards.mjs`.',
  'Confirm acceptance output includes `[acceptance] OK: content lint + docs answer consistency + docs link guard + docs index consistency guard + smoke preflight structure guard passed`.',
  'Confirm lint contract remains fixed: chapter count must be exactly `10`（hard constraint, expected 10 / actual X on mismatch）.',
  'Open `http://localhost:8080/`.',
  'Docs entry consistency check：`README.md` `## Docs` 同 `docs/README.md` 一致列出 `Docs index / Chapter schema / Chapter answer reference / Smoke answer sequence reference`，且連結可解析。',
];

function readText(path, label) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    console.error(`[smoke-preflight-structure] FAILED: cannot read ${label} (${path})`);
    console.error(error.message);
    process.exit(1);
  }
}

function sectionRange(text, heading) {
  const lines = text.split('\n');
  const headingLine = lines.findIndex((line) => line.trim() === heading);

  if (headingLine === -1) {
    return { found: false, start: -1, end: -1, lines };
  }

  let end = lines.length;
  for (let i = headingLine + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }

  return { found: true, start: headingLine + 1, end, lines };
}

const smokeText = readText(smokePath, 'tests/smoke.md');
const range = sectionRange(smokeText, '## 0) Preflight');

if (!range.found) {
  console.error('[smoke-preflight-structure] FAILED');
  console.error('- tests/smoke.md: missing section ## 0) Preflight');
  process.exit(1);
}

const checklistItems = new Map();
for (let i = range.start; i < range.end; i += 1) {
  const line = range.lines[i];
  const match = line.match(/^\s*-\s*\[ \]\s+(.+)$/);
  if (!match) continue;
  checklistItems.set(match[1].trim(), i + 1);
}

const errors = [];
for (const item of REQUIRED_ITEMS) {
  if (!checklistItems.has(item)) {
    errors.push(`tests/smoke.md##0) Preflight missing checklist item: ${item}`);
  }
}

if (errors.length > 0) {
  console.error('[smoke-preflight-structure] FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('[smoke-preflight-structure] OK: tests/smoke.md##0) Preflight contains all required checklist items');
