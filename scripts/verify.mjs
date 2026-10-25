import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateQuizContent } from "../quiz-core.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const failures = [];

const REQUIRED_FILES = [
  "index.html",
  "styles.css",
  "app.mjs",
  "quiz-core.mjs",
  "favicon.svg",
  "dev-server.mjs",
  "content/quiz-content.json",
  "README.md",
  "DEPENDENCIES.md",
  "AI_DISCLOSURE.md"
];

for (const relativePath of REQUIRED_FILES) {
  if (!existsSync(path.join(ROOT, relativePath))) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

const contentPath = path.join(ROOT, "content", "quiz-content.json");
let content = null;
if (existsSync(contentPath)) {
  try {
    content = JSON.parse(readFileSync(contentPath, "utf8"));
  } catch (error) {
    failures.push(`content/quiz-content.json is not valid JSON: ${error.message}`);
  }
}

if (content) {
  const contentErrors = validateQuizContent(content);
  failures.push(...contentErrors.map((error) => `Content: ${error}`));
}

const htmlPath = path.join(ROOT, "index.html");
if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, "utf8");
  const requiredIds = [
    "screen-home",
    "screen-quiz",
    "screen-result",
    "scenario-grid",
    "start-flooding",
    "answer-form",
    "answer-list",
    "feedback",
    "result-title",
    "retry-button",
    "another-button"
  ];

  for (const id of requiredIds) {
    if (!html.includes(`id="${id}"`)) failures.push(`index.html is missing #${id}.`);
  }

  if (!html.includes('type="module" src="./app.mjs"')) {
    failures.push("index.html must load app.mjs as a module.");
  }

  if (/<script[^>]+src="https?:\/\//i.test(html)) {
    failures.push("index.html must not load third-party scripts.");
  }

  if (/fonts\.googleapis|fonts\.gstatic/i.test(html)) {
    failures.push("index.html must not depend on remote fonts.");
  }
}

if (content) {
  const scenarioCount = content.scenarios.length;
  const questionCount = content.scenarios.reduce((sum, scenario) => sum + scenario.questions.length, 0);
  const sourceCount = content.scenarios.reduce(
    (sum, scenario) =>
      sum + scenario.questions.reduce((sourceSum, question) => sourceSum + question.sources.length, 0),
    0
  );

  console.log(`Content: ${scenarioCount} scenarios, ${questionCount} questions, ${sourceCount} source links.`);
  for (const scenario of content.scenarios) {
    console.log(`  - ${scenario.title}: ${scenario.questions.length} questions`);
  }
}

if (failures.length > 0) {
  console.error("\nVerification failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Checked ${REQUIRED_FILES.length} files. Verification passed.`);
