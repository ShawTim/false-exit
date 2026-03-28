#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

const REQUIRED_ITEMS = [
  'Docs index',
  'Chapter schema',
  'Chapter answer reference',
  'Smoke answer sequence reference',
];

function readText(path, label) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    console.error(`[doc-index-consistency] FAILED: cannot read ${label} (${path})`);
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

function parseSectionItems(text, sourceLabel, heading, sourceFilePath) {
  const range = sectionRange(text, heading);
  if (!range.found) {
    return { error: `${sourceLabel}: missing section ${heading}` };
  }

  const items = new Map();

  for (let i = range.start; i < range.end; i += 1) {
    const line = range.lines[i];
    const match = line.match(/^\s*-\s*([^:：]+)\s*[:：]\s*\[[^\]]+\]\(([^)]+)\)/);
    if (!match) continue;

    const name = match[1].trim();
    const rawTarget = match[2].trim();
    const target = rawTarget.split('#')[0].split('?')[0].trim();
    if (!target) continue;

    items.set(name, {
      line: i + 1,
      rawTarget,
      resolvedTarget: resolve(dirname(sourceFilePath), target),
    });
  }

  return { items };
}

const readmePath = resolve(repoRoot, 'README.md');
const docsReadmePath = resolve(repoRoot, 'docs/README.md');

const readmeText = readText(readmePath, 'README.md');
const docsReadmeText = readText(docsReadmePath, 'docs/README.md');

const readmeParsed = parseSectionItems(readmeText, 'README.md', '## Docs', readmePath);
const docsParsed = parseSectionItems(docsReadmeText, 'docs/README.md', '## 文件導覽', docsReadmePath);

const errors = [];

if (readmeParsed.error) errors.push(readmeParsed.error);
if (docsParsed.error) errors.push(docsParsed.error);

if (errors.length === 0) {
  for (const itemName of REQUIRED_ITEMS) {
    const readmeItem = readmeParsed.items.get(itemName);
    const docsItem = docsParsed.items.get(itemName);

    if (!readmeItem) {
      errors.push(`README.md##Docs missing: ${itemName}`);
      continue;
    }

    if (!docsItem) {
      errors.push(`docs/README.md##文件導覽 missing: ${itemName}`);
      continue;
    }

    if (readmeItem.resolvedTarget !== docsItem.resolvedTarget) {
      errors.push(
        `${itemName} target mismatch: README.md:${readmeItem.line} -> ${readmeItem.rawTarget}, docs/README.md:${docsItem.line} -> ${docsItem.rawTarget}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error('[doc-index-consistency] FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('[doc-index-consistency] OK: README.md##Docs matches docs/README.md##文件導覽 for required doc index items');
