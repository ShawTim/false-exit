#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const targetFiles = ['README.md', 'docs/README.md', 'tests/smoke.md'];

function readText(filePath) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`[doc-links] FAILED: cannot read ${filePath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function extractDestination(rawTarget) {
  const trimmed = rawTarget.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('<')) {
    const end = trimmed.indexOf('>');
    if (end > 0) {
      return trimmed.slice(1, end).trim();
    }
  }

  return trimmed.split(/\s+/)[0];
}

function isExternalLink(target) {
  if (!target) return true;
  if (target.startsWith('#')) return true;
  if (target.startsWith('/')) return true;
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(target);
}

function normalizeTarget(target) {
  return target.split('#')[0].split('?')[0].trim();
}

function lineNumberFromIndex(text, index) {
  return text.slice(0, index).split('\n').length;
}

const linkRegex = /!?\[[^\]]*\]\(([^)]+)\)/g;
const failures = [];

for (const file of targetFiles) {
  const absFilePath = resolve(repoRoot, file);
  const markdown = readText(absFilePath);

  for (const match of markdown.matchAll(linkRegex)) {
    const rawTarget = match[1] ?? '';
    const target = extractDestination(rawTarget);

    if (isExternalLink(target)) {
      continue;
    }

    const cleanTarget = normalizeTarget(target);
    if (!cleanTarget) {
      continue;
    }

    const resolvedPath = resolve(dirname(absFilePath), cleanTarget);
    if (!existsSync(resolvedPath)) {
      const line = lineNumberFromIndex(markdown, match.index ?? 0);
      failures.push({ file, line, target: cleanTarget, resolvedPath });
    }
  }
}

if (failures.length > 0) {
  console.error('[doc-links] FAILED: missing repo-local markdown link target(s)');
  failures.forEach(({ file, line, target, resolvedPath }) => {
    console.error(`- ${file}:${line} -> ${target} (missing: ${resolvedPath})`);
  });
  process.exit(1);
}

console.log('[doc-links] OK: all repo-local markdown links exist (README.md, docs/README.md, tests/smoke.md)');
