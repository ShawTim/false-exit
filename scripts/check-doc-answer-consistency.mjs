#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const defaultChapterRefPath = resolve(__dirname, '..', 'docs/chapter-answer-reference.md');
const defaultSmokeRefPath = resolve(__dirname, '..', 'docs/smoke-answer-sequence.md');

const chapterRefPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : defaultChapterRefPath;
const smokeRefPath = process.argv[3] ? resolve(process.cwd(), process.argv[3]) : defaultSmokeRefPath;

function readText(filePath, label) {
  try {
    return readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`[docs-answer-consistency] failed to read ${label}: ${filePath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function parseChapterAnswerReference(markdown) {
  const map = new Map();
  const rowRegex = /^\|\s*`chapter-(\d{2})`\s*\|[^|]*\|\s*`([^`]+)`\s*\|\s*$/gm;
  let match;

  while ((match = rowRegex.exec(markdown)) !== null) {
    const chapterNumber = Number(match[1]);
    const answer = match[2].trim();
    map.set(chapterNumber, answer);
  }

  return map;
}

function parseSmokeAnswerSequence(markdown) {
  const map = new Map();
  const rowRegex = /^\|\s*Chapter\s+(\d{1,2})\s*\|\s*`([^`]+)`\s*\|\s*$/gmi;
  let match;

  while ((match = rowRegex.exec(markdown)) !== null) {
    const chapterNumber = Number(match[1]);
    const answer = match[2].trim();
    map.set(chapterNumber, answer);
  }

  return map;
}

function expectedChapterRange() {
  return Array.from({ length: 10 }, (_, index) => index + 1);
}

const chapterRefText = readText(chapterRefPath, 'chapter-answer-reference');
const smokeRefText = readText(smokeRefPath, 'smoke-answer-sequence');

const chapterRefAnswers = parseChapterAnswerReference(chapterRefText);
const smokeRefAnswers = parseSmokeAnswerSequence(smokeRefText);

const errors = [];

for (const chapter of expectedChapterRange()) {
  const chapterRefAnswer = chapterRefAnswers.get(chapter);
  const smokeRefAnswer = smokeRefAnswers.get(chapter);

  if (!chapterRefAnswer) {
    errors.push(`missing chapter ${chapter} in chapter-answer-reference`);
    continue;
  }

  if (!smokeRefAnswer) {
    errors.push(`missing chapter ${chapter} in smoke-answer-sequence`);
    continue;
  }

  if (chapterRefAnswer !== smokeRefAnswer) {
    errors.push(
      `chapter ${chapter} mismatch: chapter-answer-reference=\`${chapterRefAnswer}\`, smoke-answer-sequence=\`${smokeRefAnswer}\``,
    );
  }
}

if (errors.length > 0) {
  console.error('[docs-answer-consistency] FAILED');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `[docs-answer-consistency] OK: chapter 1->10 answers are consistent (${chapterRefPath} <-> ${smokeRefPath})`,
);
