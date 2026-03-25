# Smoke Checklist — IPG-001 / IPG-002 / IPG-003

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Open `http://localhost:8080/`.
- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Page shows story text, puzzle prompt, answer input, and submit button.
- [ ] Before submitting correct answer, `Next Beat — The Narrow Door` is not visible.
- [ ] Enter a wrong answer (example: `出口`) and submit; retry message appears.
- [ ] After wrong answer, next beat section is still hidden.
- [ ] Enter the correct answer (`回答`) and submit; success message appears.
- [ ] After correct answer, page reveals `Next Beat — The Narrow Door` and story line `門後唔係自由，而係一間冇窗嘅控制室。`.
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.
- [ ] `README.md` includes a link to `docs/chapter-schema.md`.
- [ ] `docs/chapter-schema.md` clearly marks required vs optional fields (`nextBeat` optional).
- [ ] `docs/chapter-schema.md` includes a minimal JSON example matching `content/story/seed.json` shape.
