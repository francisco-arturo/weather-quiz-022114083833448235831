import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  advanceSession,
  answerQuestion,
  createSession,
  getCurrentQuestion,
  getResultMessage,
  getScenario,
  summarizeSession,
  validateQuizContent
} from "../quiz-core.mjs";

const content = JSON.parse(
  readFileSync(new URL("../content/quiz-content.json", import.meta.url), "utf8")
);

test("the shipped content is valid and complete", () => {
  assert.deepEqual(validateQuizContent(content), []);
  assert.equal(content.scenarios.length, 3);
  assert.equal(content.scenarios.reduce((sum, scenario) => sum + scenario.questions.length, 0), 9);
});

test("the three required scenarios are present", () => {
  assert.deepEqual(
    content.scenarios.map((scenario) => scenario.id),
    ["flooding", "heatwaves", "thunderstorms"]
  );
});

test("a full scenario scores one point per correct answer", () => {
  const scenario = getScenario(content, "flooding");
  assert.ok(scenario);

  let session = createSession(scenario.id);
  for (let index = 0; index < scenario.questions.length; index += 1) {
    const question = getCurrentQuestion(session, scenario);
    assert.equal(question.id, scenario.questions[index].id);
    session = answerQuestion(session, scenario, question.correctOptionId);
    if (index < scenario.questions.length - 1) {
      session = advanceSession(session, scenario);
    }
  }

  assert.equal(session.complete, true);
  assert.equal(session.score, 3);
  const summary = summarizeSession(session, scenario);
  assert.equal(summary.percent, 100);
  assert.equal(summary.answers.filter((answer) => answer.isCorrect).length, 3);
});

test("wrong answers are recorded and explained in the summary", () => {
  const scenario = getScenario(content, "heatwaves");
  let session = createSession(scenario.id);
  const first = getCurrentQuestion(session, scenario);
  const wrongOption = first.options.find((option) => option.id !== first.correctOptionId);

  session = answerQuestion(session, scenario, wrongOption.id);
  assert.equal(session.score, 0);
  assert.equal(session.answers[0].isCorrect, false);

  session = advanceSession(session, scenario);
  assert.equal(session.currentIndex, 1);

  const summary = summarizeSession(session, scenario);
  assert.equal(summary.answers[0].answered, true);
  assert.equal(summary.answers[0].selectedText, wrongOption.text);
  assert.ok(summary.answers[0].correctText.length > 0);
});

test("an answered question cannot be answered twice", () => {
  const scenario = getScenario(content, "thunderstorms");
  let session = createSession(scenario.id);
  const question = getCurrentQuestion(session, scenario);
  session = answerQuestion(session, scenario, question.correctOptionId);
  assert.throws(() => answerQuestion(session, scenario, question.options[0].id), /already been answered/);
});

test("advancing without an answer is rejected", () => {
  const scenario = getScenario(content, "flooding");
  const session = createSession(scenario.id);
  assert.throws(() => advanceSession(session, scenario), /Answer the current question/);
});

test("result messages cover every score band", () => {
  assert.match(getResultMessage(3, 3).title, /warning signs/);
  assert.match(getResultMessage(2, 3).title, /Strong decisions/);
  assert.match(getResultMessage(1, 3).title, /useful start/);
  assert.match(getResultMessage(0, 3).title, /practise/);
});

test("the validator rejects broken content", () => {
  const broken = structuredClone(content);
  broken.scenarios[2].questions[0].sources[0].url = "https://example.com/unsafe";
  broken.scenarios.pop();
  broken.scenarios[0].questions[0].correctOptionId = "missing";
  broken.scenarios[1].questions[0].options.pop();
  broken.meta.officialSources[0].url = "http://www.bag.admin.ch/en/heat";

  const errors = validateQuizContent(broken);
  assert.ok(errors.some((error) => /Required scenario "thunderstorms" is missing/.test(error)));
  assert.ok(errors.some((error) => /correctOptionId must match/.test(error)));
  assert.ok(errors.some((error) => /exactly 4 options/.test(error)));
  assert.ok(errors.some((error) => /official https link/.test(error)));
});
