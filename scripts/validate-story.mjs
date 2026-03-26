#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const seedPath = resolve(__dirname, '..', 'content/story/seed.json');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function pushMissing(errors, chapterLabel, fieldPath, value) {
  if (!isNonEmptyString(value)) {
    errors.push(`[${chapterLabel}] missing/empty field: ${fieldPath}`);
  }
}

let raw;
try {
  raw = readFileSync(seedPath, 'utf8');
} catch (error) {
  console.error(`[content-lint] failed to read seed file: ${seedPath}`);
  console.error(error.message);
  process.exit(1);
}

let seed;
try {
  seed = JSON.parse(raw);
} catch (error) {
  console.error(`[content-lint] invalid JSON in ${seedPath}`);
  console.error(error.message);
  process.exit(1);
}

const errors = [];
const chapters = seed?.chapters;

if (!Array.isArray(chapters)) {
  errors.push('[root] chapters must be an array');
} else {
  if (chapters.length !== 10) {
    errors.push(`[root] chapter count must be 10, got ${chapters.length}`);
  }

  chapters.forEach((chapter, index) => {
    const chapterLabel = `chapter#${index + 1}${chapter?.id ? ` ${chapter.id}` : ''}`;

    pushMissing(errors, chapterLabel, 'id', chapter?.id);
    pushMissing(errors, chapterLabel, 'title', chapter?.title);

    if (!Array.isArray(chapter?.story) || chapter.story.length === 0) {
      errors.push(`[${chapterLabel}] missing/empty field: story (non-empty array required)`);
    } else {
      chapter.story.forEach((line, storyIndex) => {
        if (!isNonEmptyString(line)) {
          errors.push(`[${chapterLabel}] missing/empty field: story[${storyIndex}]`);
        }
      });
    }

    const puzzle = chapter?.puzzle;
    if (!puzzle || typeof puzzle !== 'object') {
      errors.push(`[${chapterLabel}] missing/empty field: puzzle`);
      return;
    }

    pushMissing(errors, chapterLabel, 'puzzle.prompt', puzzle.prompt);
    pushMissing(errors, chapterLabel, 'puzzle.answer', puzzle.answer);
    pushMissing(errors, chapterLabel, 'puzzle.success', puzzle.success);
    pushMissing(errors, chapterLabel, 'puzzle.retry', puzzle.retry);
  });
}

if (errors.length > 0) {
  console.error('[content-lint] FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`[content-lint] OK: ${chapters.length} chapters validated`);
