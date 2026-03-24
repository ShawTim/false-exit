# Smoke Checklist — IPG-001 Playable Loop

- [ ] Run `python3 -m http.server 8080` from repo root.
- [ ] Open `http://localhost:8080/`.
- [ ] Page shows `False Exit` and chapter title `Chapter 1 — The Hall That Remembers`.
- [ ] Page shows story text, puzzle prompt, answer input, and submit button.
- [ ] Enter a wrong answer (example: `出口`) and submit; retry message appears.
- [ ] Enter the correct answer (`回答`) and submit; success message appears.
- [ ] Browser console shows `[false-exit] playable loop ready` and no errors.
