# Generative AI disclosure

## Tool used

This prototype was built with an AI coding assistant: **DeepSeek Harness, running a DeepSeek model**, on 24 October 2026.

## What the AI produced

- The HTML, CSS and JavaScript implementation.
- The quiz structure and the first draft of the English question wording, options, explanations and takeaways.
- The JSON content schema and the validation and scoring logic.
- This documentation and the dependency list.

No AI image generator was used. All icons and the logo are original inline SVG written for the prototype.

## What was checked

- **Content structure:** `node scripts/verify.mjs` validates that the JSON has three scenarios, three questions per scenario, four options per question, a valid correct answer for every question, and only official `https://` source links.
- **Logic:** `node tests/quiz-core.test.mjs` runs eight tests covering scoring, wrong answers, duplicate answers, progress, result messages and rejection of broken content. All eight pass.
- **Source availability:** the official Swiss federal links in the content were fetched on 24 October 2026 and returned HTTP 200.
- **Local route check:** the app shell, styles, modules, JSON content and favicon were requested from the local server and returned HTTP 200 with the expected content types.
- **UI review:** the screens and interaction states were checked in the source. A full human browser walkthrough is scheduled at the review handover before final delivery.

## What has not been checked

- The quiz content has **not** been reviewed by a teacher, a safety professional or a Swiss authority. It is a draft based on general public guidance.
- The explanations paraphrase official guidance. They are not a substitute for current official instructions or emergency advice.
- Source pages can change. Their content was not copied or frozen, so links should be checked again before publication.

## Review recommended before delivery

1. Check every correct answer and explanation against the final English content supplied by the client.
2. Confirm the emergency numbers and wording with the client's subject-matter reviewer.
3. Recheck the official source URLs before the final milestone.
4. Have a human read the full quiz for tone, reading level and curriculum fit.

This disclosure is written to be included in the project handover. It should be updated if the content changes after this date.
