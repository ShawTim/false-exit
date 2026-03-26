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
    const answerLabel = `你的答案（${chapter.title}）`;
    const feedbackId = 'answer-feedback';
    const isAnswerInvalid = state.status === 'error' && !state.solved;
    const answerErrorClass = isAnswerInvalid ? ' answer-error' : '';

    root.innerHTML = `
      <section class="card">
        <h2>${escapeHtml(chapter.title)}</h2>
        <p class="chapter-progress" aria-live="polite">Chapter ${state.chapterIndex + 1} / ${chapters.length}</p>

        <section id="puzzle-view">
          <div class="story">
            ${chapter.story.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}
          </div>
          <p class="question"><span class="question-label">Puzzle</span>${escapeHtml(chapter.puzzle.prompt)}</p>
          <form id="answer-form" class="answer-form${state.solved ? ' solved-locked' : ''}">
            <label class="label" for="answer-input">${escapeHtml(answerLabel)}</label>
            <div class="answer-row${state.solved ? ' solved-locked' : ''}${answerErrorClass}">
              <input id="answer-input" class="answer-input${answerErrorClass}" name="answer" type="text" autocomplete="off" required value="${escapeHtml(state.answer)}" aria-describedby="${feedbackId}"${isAnswerInvalid ? ' aria-invalid="true"' : ''} ${state.solved ? 'disabled' : ''} />
              <button type="submit" ${state.solved ? 'disabled' : ''}>提交答案</button>
            </div>
            ${state.solved ? '<p class="lock-hint" role="status">已完成本章，答案欄已鎖定。</p>' : '<p class="input-helper">提示：答案係兩個字。</p>'}
          </form>
          <p id="${feedbackId}" class="feedback${state.status === 'idle' ? '' : ` ${state.status}`}" role="status">${escapeHtml(state.feedback)}</p>
          ${state.solved && !hasNextChapter ? '<p id="final-state" class="final-state" role="status">你已完成目前全部章節。暫時到此。</p>' : ''}
        </section>

        <div class="controls">
          <button id="next-button" type="button" ${!state.solved || !hasNextChapter ? 'hidden disabled' : ''}>Next</button>
          <button id="restart-button" class="button-secondary" type="button">Restart</button>
        </div>
      </section>
    `;

    const form = root.querySelector('#answer-form');
    const input = root.querySelector('#answer-input');
    const answerRow = root.querySelector('.answer-row');
    const feedback = root.querySelector(`#${feedbackId}`);
    const nextButton = root.querySelector('#next-button');
    const restartButton = root.querySelector('#restart-button');

    input?.addEventListener('input', () => {
      if (state.solved) return;

      state.answer = input.value;

      if (state.status !== 'idle' || state.feedback) {
        state.status = 'idle';
        state.feedback = '';
        state.solved = false;

        if (input) {
          input.removeAttribute('aria-invalid');
          input.classList.remove('answer-error');
        }

        if (answerRow) {
          answerRow.classList.remove('answer-error');
        }

        if (feedback) {
          feedback.textContent = '';
          feedback.className = 'feedback';
        }

        if (nextButton) {
          nextButton.hidden = true;
          nextButton.disabled = true;
        }
      }
    });

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (state.solved) return;

      const nextAnswer = input?.value ?? state.answer ?? '';
      const expected = normalizeAnswer(chapter.puzzle.answer);
      const actual = normalizeAnswer(nextAnswer);
      const success = actual === expected;

      setState({
        answer: nextAnswer,
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

    if (input && !state.solved) {
      input.focus();

      if (state.status === 'error') {
        input.select();
      }
    }
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
