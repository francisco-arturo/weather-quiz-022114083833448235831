# Session Handoff — Weatherwise (weather-quiz-022114083833448235831)

## Last Updated

- 2026-10-24 — full prototype built, verified, pushed and deployed. Live at https://weather-quiz-022114083833448235831.vercel.app. Proposal is the remaining step.

## Current Objective

A mobile-friendly educational quiz about extreme weather safety in Switzerland: flooding, heatwaves and severe thunderstorms, with feedback, official guidance links and score summaries.

## Recommended Next Step

1. Draft the Upwork proposal against the live URL and repository, following `upwork-kit/PLAYBOOK.md`.
2. Run the pre-submit checklist, count the characters, and scan for em dashes before sending.
3. Log the sent proposal in `upwork-kit/TRACKER.csv` with the hook type used.

## State

- All three scenarios implemented.
- `feature_list.json` marks `proto-001` done with verification evidence.
- Live URL: https://weather-quiz-022114083833448235831.vercel.app
- Repository: https://github.com/francisco-arturo/weather-quiz-022114083833448235831
- Verification is green: 8/8 tests, content check passed, five live routes returned HTTP 200.
- Proposal is not yet written or sent.

## Files

- `index.html`, `styles.css`, `app.mjs`, `quiz-core.mjs` — application.
- `content/quiz-content.json` — single editable content file.
- `dev-server.mjs` — local server (excluded from Vercel).
- `tests/quiz-core.test.mjs`, `scripts/verify.mjs` — automated checks.
- `README.md`, `DEPENDENCIES.md`, `AI_DISCLOSURE.md`, `DEMO.md` — handover documents.
- `init.ps1`, `init.sh` — verification entrypoints.

## Blockers

- None for the local build.
- Deployment waits for user approval and a repository URL, as required by the workspace gate.
- Headless screenshot QA was blocked by the sandbox; a human browser review is the next visual check.

## Next Session

- Do not create a second directory for this prototype.
- If the baseline gate is red on arrival, fix that before adding scope.
- Keep the content in JSON; do not hard-code quiz copy into the app.
- If the local server is gone, start it with `$env:PORT = 4174; node dev-server.mjs`.
