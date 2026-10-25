# Demo — Weatherwise (weather-quiz-022114083833448235831)

## Status

- **Live URL:** **https://weather-quiz-022114083833448235831.vercel.app**
- **Repository:** https://github.com/francisco-arturo/weather-quiz-022114083833448235831
- **Local fallback:** `node dev-server.mjs` → http://127.0.0.1:4173
- **Last verified:** 2026-10-24
- **Vercel deployment:** `dpl_9ZXkGdrMi3now6bLrPcKs3VrP5SG`, status READY

The live route was checked with Node fetch after deployment:

| Route | Result |
|---|---|
| `/` | 200, `text/html` |
| `/content/quiz-content.json` | 200, `application/json` |
| `/app.mjs` | 200, `application/javascript` |
| `/styles.css` | 200, `text/css` |
| `/favicon.svg` | 200, `image/svg+xml` |

## The 60-second path

| # | Do this | The visitor should see |
|---|---|---|
| 1 | Open the live URL | The home page with the dark hazard briefing card and three scenario cards (Flooding, Heatwaves, Severe thunderstorms). |
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
- The headless browser screenshot step was blocked by the agent sandbox (crashpad `OpenProcess` denial), so visual QA relies on the source and a human browser walkthrough.

## If something fails while they look

- If the page says the content could not be loaded, check that `/content/quiz-content.json` returns 200 on the live URL.
- Hard-refresh with Ctrl+F5 if the browser has an old module cached.
- Redeploy with `node .harness/deploy.mjs weather-quiz-022114083833448235831` from the workspace root.
- Rerun verification with `powershell -ExecutionPolicy Bypass -File .\init.ps1`.

## Not built (next, if the user wants it)

- The client-authored English content and exact official guidance links from the brief.
- A short checklist for reviewing and replacing content before each semester.
- Optional teacher-facing summary or printable score sheet, only if separately agreed.
