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

      <section id="puzzle-view">
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

      <section id="next-view" class="story" hidden>
        <h3>${escapeHtml(chapter.nextBeat?.title || 'Next Beat')}</h3>
        ${(Array.isArray(chapter.nextBeat?.story) ? chapter.nextBeat.story : [])
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join('')}
      </section>

      <div class="controls">
        <button id="next-button" type="button" hidden>Next</button>
        <button id="restart-button" class="button-secondary" type="button">Restart</button>
      </div>
    </section>
  `;

  const form = root.querySelector('#answer-form');
  const input = root.querySelector('#answer-input');
  const feedback = root.querySelector('#feedback');
  const puzzleView = root.querySelector('#puzzle-view');
  const nextView = root.querySelector('#next-view');
  const nextButton = root.querySelector('#next-button');
  const restartButton = root.querySelector('#restart-button');

  const expected = normalizeAnswer(chapter.puzzle.answer);
  const hasNextBeat = Boolean(chapter.nextBeat);

  function createInitialState() {
    return {
      answer: '',
      status: 'idle',
      feedback: '',
      view: 'puzzle',
      solved: false,
    };
  }

  let state = createInitialState(chapter);

  function renderState() {
    if (input && input.value !== state.answer) {
      input.value = state.answer;
    }

    if (feedback) {
      feedback.textContent = state.feedback;
      feedback.className = `feedback${state.status === 'idle' ? '' : ` ${state.status}`}`;
    }

    if (puzzleView) {
      puzzleView.hidden = state.view !== 'puzzle';
    }

    if (nextView) {
      nextView.hidden = state.view !== 'next';
    }

    if (nextButton) {
      nextButton.hidden = !state.solved || !hasNextBeat;
      nextButton.disabled = !state.solved || !hasNextBeat;
    }
  }

  function setState(partial) {
    state = {
      ...state,
      ...partial,
    };
    renderState();
  }

  input?.addEventListener('input', () => {
    setState({ answer: input.value });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const actual = normalizeAnswer(state.answer);
    const success = actual === expected;

    setState({
      status: success ? 'success' : 'error',
      feedback: success ? chapter.puzzle.success : chapter.puzzle.retry,
      solved: success,
      view: 'puzzle',
    });
  });

  nextButton?.addEventListener('click', () => {
    if (!hasNextBeat || !state.solved) return;
    setState({ view: 'next' });
  });

  restartButton?.addEventListener('click', () => {
    state = createInitialState(chapter);
    renderState();
    input?.focus();
  });

  renderState();
  input?.focus();
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
