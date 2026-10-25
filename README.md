# Weatherwise

A small educational quiz about extreme weather safety in Switzerland, built for students. It covers three scenarios: flooding, heatwaves and severe thunderstorms. Each has three multiple-choice questions, immediate feedback, official guidance links and a final score.

The prototype is a static web app. There is no build step, no account, no database and no live weather data.

## Quick start

Requirements: **Node.js 18 or newer** for the local server. Nothing to install.

```powershell
node dev-server.mjs
```

Open **http://127.0.0.1:4173**.

If port 4173 is already in use, pick another one:

```powershell
$env:PORT = 4174; node dev-server.mjs
```

```bash
PORT=4174 node dev-server.mjs
```

The content is loaded with `fetch`, so open the app through the local server rather than double-clicking `index.html`.

If you prefer Python:

```powershell
python -m http.server 4173
```

Then open **http://127.0.0.1:4173**.

## What the demo covers

- Home page with three scenarios: **Flooding**, **Heatwaves**, **Severe thunderstorms**.
- Three questions per scenario, four options each.
- One-click answer checking with:
  - a clear correct/not quite verdict,
  - a short explanation,
  - one or two links to official Swiss federal guidance.
- Live score while answering.
- Final score out of three, a review of every decision, key takeaways, and buttons to:
  - try the same scenario again,
  - choose another scenario,
  - jump straight into the next scenario.
- Last score per scenario is kept in memory for the current browser session.
- Responsive layout for phones, tablets and desktop.
- Keyboard-accessible radio answers, visible focus states, skip link and reduced-motion support.

## Verification

Run the content and structure check:

```powershell
node scripts/verify.mjs
```

Run the unit tests:

```powershell
node tests/quiz-core.test.mjs
```

Expected result: 8 tests pass. The test file uses Node's built-in test runner and does not need a package install.

The two commands can also be run through the harness entrypoint:

```powershell
powershell -ExecutionPolicy Bypass -File .\init.ps1
```

or, in bash:

```bash
./init.sh
```

## Editing the content

All editable content lives in one file:

```text
content/quiz-content.json
```

The app validates this file on load and the verification script checks it in CI or locally. The important parts of the schema:

| Field | Meaning |
|---|---|
| `meta` | Title, emergency number, disclaimer, review status and official sources |
| `scenarios[]` | Exactly three scenarios, with IDs `flooding`, `heatwaves` and `thunderstorms` |
| `scenario.title` | Display name |
| `scenario.summary` | Short card description |
| `scenario.setting` | Situation shown beside each question |
| `scenario.fieldNote` | One memorable safety fact |
| `scenario.takeaways[]` | Shown on the result screen |
| `scenario.questions[]` | Exactly three questions per scenario |
| `question.options[]` | Exactly four options, each with a unique `id` and `text` |
| `question.correctOptionId` | Must match one option `id` |
| `question.explanation` | Feedback shown after an answer |
| `question.sources[]` | Official `https://` links, each with a `label` and `url` |

Source URLs are deliberately restricted to Swiss federal domains (`*.admin.ch`) and `alert.swiss`. If the client supplies different official guidance, update the URLs and rerun `node scripts/verify.mjs`.

No copy is embedded in the app code. To change a question, explanation or source, edit the JSON only.

## Project structure

```text
index.html                  App shell and static screens
styles.css                  Visual design and responsive layout
app.mjs                     Screen flow, rendering and browser events
quiz-core.mjs               Validation, scoring and summary logic
content/quiz-content.json   All quiz content
dev-server.mjs              Dependency-free local static server
tests/quiz-core.test.mjs    Eight logic and content tests
scripts/verify.mjs          File, structure and content checks
DEPENDENCIES.md             Dependencies and third-party assets
AI_DISCLOSURE.md            Generative AI use and checking
```

## Deployment

The app is deployment-ready as a static site. Upload the repository root to any static host, keeping `index.html`, `styles.css`, `app.mjs`, `quiz-core.mjs`, `favicon.svg` and `content/` together.

The included `.vercelignore` excludes the local server, tests, scripts and documentation from a Vercel deployment. No environment variables or server functions are required.

## Scope and limits

This is a learning prototype, not an official warning product.

- It does **not** show live alerts, weather warnings or emergency information.
- It has **no** accounts, payments, analytics or database.
- It does **not** store results after the browser tab is closed.
- The content is a draft for the student team to review and replace. It has not been reviewed by a Swiss authority.
- In an emergency, call **112** in Switzerland. For current warnings, use [Alertswiss](https://www.babs.admin.ch/en/alertswiss-en) and [MeteoSwiss](https://www.meteoswiss.admin.ch/weather.html).

## Content sources

The prototype links to official Swiss federal pages:

- [MeteoSwiss: Weather](https://www.meteoswiss.admin.ch/weather.html)
- [FOEN: Flooding](https://www.bafu.admin.ch/en/flooding)
- [FOPH: Protecting yourself and others in hot weather](https://www.bag.admin.ch/en/heat)
- [FOCP: Issuing natural danger warnings](https://www.babs.admin.ch/en/issuing-natural-danger-warnings-to-the-public)
- [Alertswiss: Alerts and warnings](https://www.babs.admin.ch/en/alertswiss-en)

## Dependencies and AI disclosure

There are **no third-party packages, fonts, images or scripts**. See [DEPENDENCIES.md](DEPENDENCIES.md) for the dependency and asset list.

See [AI_DISCLOSURE.md](AI_DISCLOSURE.md) for the disclosure of generative AI use and how the output was checked.
