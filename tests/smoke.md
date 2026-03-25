# Smoke Checklist — IPG-001 / IPG-002 / IPG-003 / IPG-004

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Open `http://localhost:8080/`.
- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Page shows story text, puzzle prompt, answer input, submit button, and `Restart` button.
- [ ] Before submitting correct answer, `Next Beat — The Narrow Door` is not visible and `Next` button is hidden.
- [ ] Enter a wrong answer (example: `出口`) and submit; retry message appears.
- [ ] After wrong answer, puzzle stays visible and `Next` remains hidden.
- [ ] Enter the correct answer (`回答`) and submit; success message appears.
- [ ] After correct answer, `Next` button becomes visible while next beat content is still not shown yet.
- [ ] Click `Next`; puzzle view hides and page switches to `Next Beat — The Narrow Door` with story line `門後唔係自由，而係一間冇窗嘅控制室。`.
- [ ] Click `Restart` from next beat state; page returns to the initial puzzle state, clears input/feedback, hides `Next`, and hides next beat content again.
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.
- [ ] `README.md` includes a link to `docs/chapter-schema.md`.
- [ ] `docs/chapter-schema.md` clearly marks required vs optional fields (`nextBeat` optional).
- [ ] `docs/chapter-schema.md` includes a minimal JSON example matching `content/story/seed.json` shape.
