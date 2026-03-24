async function loadGame() {
  const root = document.getElementById('game-root');

  if (!root) {
    console.error('[false-exit] missing #game-root');
    return;
  }

  try {
    const response = await fetch('./content/story/seed.json');
    const data = await response.json();
    const chapter = data?.chapters?.[0];

    if (!chapter?.puzzle) {
      throw new Error('Missing chapter puzzle data');
    }

    renderChapter(root, chapter);
    console.log('[false-exit] playable loop ready');
  } catch (error) {
    console.error('[false-exit] failed to load game', error);
    root.innerHTML = '<p class="feedback error">載入失敗。seed 資料壞咗。</p>';
  }
}

function renderChapter(root, chapter) {
  root.innerHTML = `
    <section class="card">
      <h2>${escapeHtml(chapter.title)}</h2>
      <div class="story">
        ${chapter.story.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
      </div>
      <p class="question"><span class="question-label">Puzzle</span>${escapeHtml(chapter.puzzle.prompt)}</p>
      <form id="answer-form">
        <label class="label" for="answer-input">你的答案</label>
        <div class="answer-row">
          <input id="answer-input" name="answer" type="text" autocomplete="off" required />
          <button type="submit">提交</button>
        </div>
      </form>
      <p id="feedback" class="feedback" role="status"></p>
    </section>
  `;

  const form = root.querySelector('#answer-form');
  const input = root.querySelector('#answer-input');
  const feedback = root.querySelector('#feedback');
  const expected = normalizeAnswer(chapter.puzzle.answer);

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const actual = normalizeAnswer(input?.value || '');
    const success = actual === expected;

    feedback.textContent = success ? chapter.puzzle.success : chapter.puzzle.retry;
    feedback.className = `feedback ${success ? 'success' : 'error'}`;
  });
}

function normalizeAnswer(value) {
  return value.trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

loadGame();
