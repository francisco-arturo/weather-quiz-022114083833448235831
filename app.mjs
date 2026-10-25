import {
  advanceSession,
  answerQuestion,
  createSession,
  getCurrentQuestion,
  getResultMessage,
  getScenario,
  summarizeSession,
  validateQuizContent
} from "./quiz-core.mjs";

const ICONS = {
  flood: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 12c3 0 3 2.5 6 2.5S13 12 16 12s3 2.5 6 2.5S25 12 28 12"/>
      <path d="M4 20c3 0 3 2.5 6 2.5S13 20 16 20s3 2.5 6 2.5S25 20 28 20"/>
      <path d="M16 4v9M12.5 7.5 16 4l3.5 3.5"/>
    </svg>`,
  heat: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="5.5"/>
      <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8"/>
    </svg>`,
  storm: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 21h18a4.8 4.8 0 0 0 .8-9.5A7.8 7.8 0 0 0 10.2 13 4.2 4.2 0 0 0 7 21Z"/>
      <path d="m18 19-4 6h3.4L15.8 31l6-8h-4l1.2-4Z"/>
    </svg>`,
  check: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10.5 4 4 8-9"/>
    </svg>`,
  cross: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15"/>
    </svg>`,
  arrow: `
    <svg class="button-icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5"/>
    </svg>`,
  external: `
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M11 4h5v5M16 4l-7 7M8 5H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3"/>
    </svg>`
};

const PALETTES = {
  flooding: ["--flood", "--flood-tint"],
  heatwaves: ["--heat", "--heat-tint"],
  thunderstorms: ["--storm", "--storm-tint"]
};

const state = {
  content: null,
  scenario: null,
  session: null,
  selectedOptionId: null,
  results: {}
};

const byId = (id) => document.getElementById(id);

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });

function iconFor(name) {
  return ICONS[name] ?? ICONS.storm;
}

function applyAccent(scenarioId) {
  const [accent, tint] = PALETTES[scenarioId] ?? PALETTES.flooding;
  document.documentElement.style.setProperty("--accent", `var(${accent})`);
  document.documentElement.style.setProperty("--accent-tint", `var(${tint})`);
}

function showScreen(name) {
  for (const screen of ["home", "quiz", "result"]) {
    byId(`screen-${screen}`).hidden = screen !== name;
  }
  window.scrollTo(0, 0);
}

function focusHeading(element) {
  if (!element) return;
  element.focus({ preventScroll: true });
}

function renderScenarioCards() {
  const grid = byId("scenario-grid");
  if (!state.content) return;

  grid.innerHTML = state.content.scenarios
    .map((scenario) => {
      const result = state.results[scenario.id];
      const [accent, tint] = PALETTES[scenario.id] ?? PALETTES.flooding;
      const completed = result ? `<span class="scenario-result">Last: ${result.score}/${result.total}</span>` : "";
      const buttonLabel = result ? "Try again" : "Start scenario";

      return `
        <article class="scenario-card" style="--accent: var(${accent}); --accent-tint: var(${tint});">
          <div class="scenario-card-top">
            <span class="scenario-icon" aria-hidden="true">${iconFor(scenario.icon)}</span>
            <span class="scenario-number">${escapeHtml(scenario.number)}</span>
          </div>
          <div class="scenario-card-body">
            <p class="scenario-kicker">${escapeHtml(scenario.kicker)}</p>
            <h3>${escapeHtml(scenario.title)}</h3>
            <p class="scenario-summary">${escapeHtml(scenario.summary)}</p>
            <div class="scenario-meta">
              <span>${scenario.questions.length} questions</span>
              <span>${escapeHtml(scenario.duration)}</span>
            </div>
            <div class="scenario-card-footer">
              <button class="scenario-start" type="button" data-scenario="${escapeHtml(scenario.id)}">
                ${buttonLabel}
                ${ICONS.arrow}
              </button>
              ${completed}
            </div>
          </div>
        </article>`;
    })
    .join("");
}

function renderDialog() {
  if (!state.content) return;
  const { meta } = state.content;
  byId("dialog-sources").innerHTML = meta.officialSources
    .map(
      (source) =>
        `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ${ICONS.external}</a></li>`
    )
    .join("");
  byId("dialog-review-note").textContent = `${meta.disclaimer} ${meta.reviewStatus}`;
}

function startScenario(scenarioId) {
  const scenario = getScenario(state.content, scenarioId);
  if (!scenario) {
    showLoadError(`The scenario "${scenarioId}" is not in the content file.`);
    return;
  }

  state.scenario = scenario;
  state.session = createSession(scenarioId);
  state.selectedOptionId = null;
  applyAccent(scenario.id);
  renderQuiz();
  showScreen("quiz");
  requestAnimationFrame(() => focusHeading(byId("question-prompt")));
}

function renderQuiz() {
  const scenario = state.scenario;
  const session = state.session;
  if (!scenario || !session) return;

  const question = getCurrentQuestion(session, scenario);
  if (!question) {
    showResult();
    return;
  }

  const position = session.currentIndex + 1;
  const total = scenario.questions.length;

  byId("quiz-scenario-name").textContent = scenario.title;
  byId("quiz-question-position").textContent = `Question ${position} of ${total}`;
  byId("quiz-score").textContent = String(session.score);
  byId("quiz-progress").style.width = `${(position / total) * 100}%`;

  byId("brief-icon").innerHTML = iconFor(scenario.icon);
  byId("brief-title").textContent = scenario.title;
  byId("brief-summary").textContent = scenario.summary;
  byId("brief-setting").textContent = scenario.setting;
  byId("brief-note").textContent = scenario.fieldNote;

  byId("question-kicker").textContent = `Decision ${String(position).padStart(2, "0")}`;
  byId("question-prompt").textContent = question.prompt;
  byId("question-prompt").focus({ preventScroll: true });

  byId("answer-list").innerHTML = question.options
    .map(
      (option, index) => `
        <label class="answer-option" data-option="${escapeHtml(option.id)}">
          <input type="radio" name="answer" value="${escapeHtml(option.id)}" />
          <span class="option-key">${String.fromCharCode(97 + index)}</span>
          <span class="option-text">${escapeHtml(option.text)}</span>
          <span class="option-mark" aria-hidden="true">${ICONS.check}</span>
        </label>`
    )
    .join("");

  const form = byId("answer-form");
  form.classList.remove("is-locked");
  byId("check-button").disabled = true;
  byId("answer-hint").textContent = "Select an answer to continue.";
  byId("feedback").hidden = true;
  byId("feedback").classList.remove("is-incorrect");
  state.selectedOptionId = null;

  byId("answer-list")
    .querySelectorAll('input[type="radio"]')
    .forEach((input) => input.addEventListener("change", onOptionChange));
}

function onOptionChange(event) {
  if (!event.target.matches('input[type="radio"]')) return;
  state.selectedOptionId = event.target.value;

  byId("answer-list")
    .querySelectorAll(".answer-option")
    .forEach((label) => {
      label.classList.toggle("is-selected", label.dataset.option === state.selectedOptionId);
    });

  byId("check-button").disabled = false;
  byId("answer-hint").textContent = "Ready when you are.";
}

function markAnswerOptions(question, selectedOptionId) {
  byId("answer-list")
    .querySelectorAll(".answer-option")
    .forEach((label) => {
      const optionId = label.dataset.option;
      const input = label.querySelector("input");
      const mark = label.querySelector(".option-mark");
      input.disabled = true;
      label.classList.add("is-locked");

      if (optionId === question.correctOptionId) {
        label.classList.add("is-correct");
        mark.innerHTML = ICONS.check;
      } else if (optionId === selectedOptionId) {
        label.classList.add("is-wrong");
        mark.innerHTML = ICONS.cross;
      } else {
        label.classList.add("is-muted");
        mark.innerHTML = ICONS.check;
      }
    });
}

function checkAnswer() {
  if (!state.selectedOptionId || !state.scenario || !state.session) return;

  const question = getCurrentQuestion(state.session, state.scenario);
  if (!question) return;

  const selectedOptionId = state.selectedOptionId;
  state.session = answerQuestion(state.session, state.scenario, selectedOptionId);
  const answer = state.session.answers[state.session.answers.length - 1];
  const correctOption = question.options.find((option) => option.id === question.correctOptionId);

  markAnswerOptions(question, selectedOptionId);
  byId("answer-form").classList.add("is-locked");
  byId("quiz-score").textContent = String(state.session.score);

  const feedback = byId("feedback");
  feedback.hidden = false;
  feedback.classList.toggle("is-incorrect", !answer.isCorrect);
  byId("feedback-symbol").innerHTML = answer.isCorrect ? ICONS.check : ICONS.cross;
  byId("feedback-verdict").textContent = answer.isCorrect ? "Correct" : "Not quite";
  byId("feedback-lead").textContent = answer.isCorrect
    ? "That is the safer move."
    : `The safer move: ${correctOption.text}`;
  byId("feedback-explanation").textContent = question.explanation;
  byId("feedback-sources").innerHTML = question.sources
    .map(
      (source) =>
        `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ${ICONS.external}</a>`
    )
    .join("");
  byId("feedback-score").textContent = `Score ${state.session.score} of ${state.scenario.questions.length} · ${state.session.answers.length} answered`;

  const isLast = state.session.currentIndex >= state.scenario.questions.length - 1;
  byId("next-button").innerHTML = isLast ? `See my result ${ICONS.arrow}` : `Next decision ${ICONS.arrow}`;

  requestAnimationFrame(() => {
    feedback.focus({ preventScroll: true });
    feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function nextQuestion() {
  if (!state.scenario || !state.session) return;

  if (state.session.complete) {
    showResult();
    return;
  }

  state.session = advanceSession(state.session, state.scenario);
  state.selectedOptionId = null;
  renderQuiz();
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    focusHeading(byId("question-prompt"));
  });
}

function showResult() {
  const scenario = state.scenario;
  const session = state.session;
  if (!scenario || !session) return;

  const summary = summarizeSession(session, scenario);
  const message = getResultMessage(summary.score, summary.total);
  state.results[scenario.id] = { score: summary.score, total: summary.total };

  applyAccent(scenario.id);
  byId("result-eyebrow").textContent = `${scenario.title} · complete`;
  byId("result-title").textContent = message.title;
  byId("result-message").textContent = message.message;
  byId("result-score").textContent = String(summary.score);
  byId("result-total").textContent = String(summary.total);
  byId("review-subtitle").textContent = `${summary.score} of ${summary.total} correct`;
  byId("score-orbit").style.setProperty("--score", String(summary.percent));

  byId("review-list").innerHTML = summary.answers
    .map(
      (answer) => `
        <li class="review-item ${answer.isCorrect ? "is-correct" : "is-wrong"}">
          <span class="review-mark" aria-hidden="true">${answer.isCorrect ? ICONS.check : ICONS.cross}</span>
          <div class="review-copy">
            <h3>${escapeHtml(answer.shortLabel)}</h3>
            <p class="review-answer">
              <span class="review-answer-label">Your answer</span>
              ${escapeHtml(answer.selectedText ?? "Not answered")}
            </p>
            ${
              answer.isCorrect
                ? ""
                : `<p class="review-answer is-missed">
                    <span class="review-answer-label">Safer answer</span>
                    ${escapeHtml(answer.correctText)}
                  </p>`
            }
          </div>
        </li>`
    )
    .join("");

  byId("takeaway-list").innerHTML = scenario.takeaways
    .map((takeaway) => `<li>${escapeHtml(takeaway)}</li>`)
    .join("");

  const primarySource = scenario.questions[0].sources[0];
  byId("takeaway-source").innerHTML = `
    <a href="${escapeHtml(primarySource.url)}" target="_blank" rel="noreferrer">
      Read the official guidance ${ICONS.external}
    </a>`;

  const currentIndex = state.content.scenarios.findIndex((item) => item.id === scenario.id);
  const nextScenario = state.content.scenarios[(currentIndex + 1) % state.content.scenarios.length];
  byId("next-scenario").hidden = false;
  byId("next-scenario-title").textContent = nextScenario.title;
  byId("next-scenario-summary").textContent = nextScenario.summary;
  byId("next-scenario-button").dataset.scenario = nextScenario.id;

  showScreen("result");
  requestAnimationFrame(() => focusHeading(byId("result-title")));
}

function goHome(options = {}) {
  applyAccent("flooding");
  state.session = null;
  state.scenario = null;
  state.selectedOptionId = null;
  renderScenarioCards();
  showScreen("home");

  if (options.focusScenarios) {
    const heading = byId("scenario-heading");
    heading.setAttribute("tabindex", "-1");
    requestAnimationFrame(() => {
      byId("scenarios").scrollIntoView({ behavior: "smooth", block: "start" });
      heading.focus({ preventScroll: true });
    });
  } else {
    requestAnimationFrame(() => focusHeading(byId("home-title")));
  }
}

function openAbout() {
  const dialog = byId("about-dialog");
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeAbout() {
  const dialog = byId("about-dialog");
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function showLoadError(message) {
  const errorBox = byId("load-error");
  errorBox.hidden = false;
  const detail = errorBox.querySelector("p");
  if (detail && message) {
    detail.textContent = message;
  }
}

function bindEvents() {
  byId("brand-home").addEventListener("click", () => goHome());
  byId("quiz-back").addEventListener("click", () => goHome());
  byId("start-flooding").addEventListener("click", () => startScenario("flooding"));

  byId("scenario-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-scenario]");
    if (button) startScenario(button.dataset.scenario);
  });

  byId("answer-form").addEventListener("submit", (event) => {
    event.preventDefault();
    checkAnswer();
  });

  byId("next-button").addEventListener("click", nextQuestion);
  byId("retry-button").addEventListener("click", () => startScenario(state.scenario.id));
  byId("another-button").addEventListener("click", () => goHome({ focusScenarios: true }));

  byId("next-scenario-button").addEventListener("click", (event) => {
    startScenario(event.currentTarget.dataset.scenario);
  });

  byId("about-button").addEventListener("click", openAbout);
  byId("dialog-close").addEventListener("click", closeAbout);
  byId("dialog-done").addEventListener("click", closeAbout);

  const dialog = byId("about-dialog");
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeAbout();
  });
}

async function init() {
  bindEvents();

  try {
    const response = await fetch("./content/quiz-content.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Content request returned ${response.status}.`);
    }

    const content = await response.json();
    const errors = validateQuizContent(content);
    if (errors.length > 0) {
      throw new Error(`Content validation failed: ${errors.join(" ")}`);
    }

    state.content = content;
    renderScenarioCards();
    renderDialog();
    applyAccent("flooding");
  } catch (error) {
    console.error(error);
    byId("scenario-grid").innerHTML =
      '<p class="loading-note">Scenarios could not be loaded. Open the prototype through the local server and check the content file.</p>';
    showLoadError(
      "Start the local server with node dev-server.mjs, then open http://127.0.0.1:4173. If the server is already running, check content/quiz-content.json."
    );
  }
}

init();
