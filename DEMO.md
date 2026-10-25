# Demo — Weatherwise (weather-quiz-022114083833448235831)

## Status

- **Live URL:** not deployed yet. The local build is waiting for the user's review and repository URL.
- **Local preview:** **http://127.0.0.1:4174**
- **Start command:** `$env:PORT = 4174; node dev-server.mjs` (from this directory)
- **Default command:** `node dev-server.mjs` → `http://127.0.0.1:4173`
- **Last verified:** 2026-10-24

Port 4174 is used for the review because another process already holds 4173 on this machine. The app itself defaults to 4173.

## The 60-second path

| # | Do this | The visitor should see |
|---|---|---|
| 1 | Open http://127.0.0.1:4174/ | The home page with the dark hazard briefing card and three scenario cards (Flooding, Heatwaves, Severe thunderstorms). |
| 2 | Click **Start with flooding** | The flooding scenario, with the situation on the left and the first decision on the right. |
| 3 | Choose **Move to higher ground and away from the water**, then **Check answer** | A green “Correct” feedback panel with the explanation, FOEN/FOCP links and an updated score. |
| 4 | Continue through the other two flooding questions | Feedback after each answer, including the safer answer when a choice is wrong. |
| 5 | Finish the third question | A score out of 3, a review of every decision, three takeaways, **Try this scenario again** and **Choose another scenario**. |
| 6 | Click **Choose another scenario** | Back on the home page, with a “Last: 2/3” badge on the completed card. |
| 7 | Open **About & sources** | A dialog with the scope, emergency numbers, official source list and the draft-content note. |

## What this demonstrates

A complete, mobile-first learning loop: scenario selection, one decision at a time, immediate explanation, official guidance, scoring and a summary that lets the learner retry or move on.

## What is deliberately fake or limited

- The quiz content is a **draft** written for the prototype. It has not been reviewed by a Swiss authority and should be replaced or approved by the student team.
- There are **no live weather alerts**, no MeteoSwiss API, no Alertswiss feed and no location detection.
- Scores live in browser memory only. Reloading the page starts again; there is no account, database or results history.
- Official guidance is **linked**, not embedded or mirrored.
- The local Node server is for development only and is excluded from the deployment.
- The headless browser screenshot step was blocked by the agent sandbox (crashpad `OpenProcess` denial), so the handover relies on route checks, content tests and a source review. A human browser walkthrough is the next review step.

## If something fails while they look

- If the page says the content could not be loaded, make sure it is open through `node dev-server.mjs`, not as a `file://` path.
- If the port is wrong, check the terminal line printed by the server.
- If the browser has an old module cached, hard-refresh with Ctrl+F5.
- Rerun verification with `powershell -ExecutionPolicy Bypass -File .\init.ps1`.

## Not built (next, if the user wants it)

- The remaining client-authored English content and exact official guidance links from the brief.
- A short checklist for reviewing and replacing content before each semester.
- Optional teacher-facing summary or printable score sheet, only if separately agreed.
- Deployment after approval, then the proposal.
