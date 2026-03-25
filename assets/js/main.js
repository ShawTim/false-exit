async function loadGame() {
  const root = document.getElementById('game-root');

  if (!root) {
    console.error('[false-exit] missing #game-root');
    return;
  }

  try {
    const response = await fetch('./content/story/seed.json');
    const data = await response.json();
    const chapters = Array.isArray(data?.chapters) ? data.chapters : [];

    if (!chapters.length || chapters.some((chapter) => !chapter?.puzzle)) {
      throw new Error('Missing playable chapter puzzle data');
    }

    renderGame(root, chapters);
    console.log('[false-exit] playable loop ready');
  } catch (error) {
    console.error('[false-exit] failed to load game', error);
    root.innerHTML = '<p class="feedback error">載入失敗。seed 資料壞咗。</p>';
  }
}

function renderGame(root, chapters) {
  function createInitialState() {
    return {
      chapterIndex: 0,
      answer: '',
      status: 'idle',
      feedback: '',
      solved: false,
    };
  }

  let state = createInitialState();

  function setState(partial) {
    state = {
      ...state,
      ...partial,
    };

    renderState();
  }

  function goToChapter(index) {
    setState({
      chapterIndex: index,
      answer: '',
      status: 'idle',
      feedback: '',
      solved: false,
    });
  }

  function renderState() {
    const chapter = chapters[state.chapterIndex];
    const hasNextChapter = state.chapterIndex < chapters.length - 1;

    root.innerHTML = `
      <section class="card">
        <h2>${escapeHtml(chapter.title)}</h2>

        <section id="puzzle-view">
          <div class="story">
            ${chapter.story.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
          </div>
          <p class="question"><span class="question-label">Puzzle</span>${escapeHtml(chapter.puzzle.prompt)}</p>
          <form id="answer-form">
            <label class="label" for="answer-input">你的答案</label>
            <div class="answer-row">
              <input id="answer-input" name="answer" type="text" autocomplete="off" required value="${escapeHtml(state.answer)}" />
              <button type="submit">提交</button>
            </div>
          </form>
          <p id="feedback" class="feedback${state.status === 'idle' ? '' : ` ${state.status}`}" role="status">${escapeHtml(state.feedback)}</p>
        </section>

        <div class="controls">
          <button id="next-button" type="button" ${!state.solved || !hasNextChapter ? 'hidden disabled' : ''}>Next</button>
          <button id="restart-button" class="button-secondary" type="button">Restart</button>
        </div>
      </section>
    `;

    const form = root.querySelector('#answer-form');
    const input = root.querySelector('#answer-input');
    const nextButton = root.querySelector('#next-button');
    const restartButton = root.querySelector('#restart-button');

    input?.addEventListener('input', () => {
      setState({ answer: input.value });
    });

    form?.addEventListener('submit', (event) => {
      event.preventDefault();

      const expected = normalizeAnswer(chapter.puzzle.answer);
      const actual = normalizeAnswer(state.answer);
      const success = actual === expected;

      setState({
        status: success ? 'success' : 'error',
        feedback: success ? chapter.puzzle.success : chapter.puzzle.retry,
        solved: success,
      });
    });

    nextButton?.addEventListener('click', () => {
      if (!state.solved || !hasNextChapter) return;
      goToChapter(state.chapterIndex + 1);
    });

    restartButton?.addEventListener('click', () => {
      state = createInitialState();
      renderState();
    });

    input?.focus();
  }

  renderState();
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
