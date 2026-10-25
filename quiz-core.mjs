export const REQUIRED_SCENARIO_IDS = ["flooding", "heatwaves", "thunderstorms"];
export const QUESTIONS_PER_SCENARIO = 3;
export const OPTIONS_PER_QUESTION = 4;

const OFFICIAL_HOSTS = ["admin.ch", "alert.swiss"];

function isText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isOfficialUrl(value) {
  if (!isText(value)) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return OFFICIAL_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export function validateQuizContent(content) {
  const errors = [];

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return ["Content must be a JSON object."];
  }

  const meta = content.meta;
  if (!meta || typeof meta !== "object") {
    errors.push("meta is required.");
  } else {
    if (!isText(meta.title)) errors.push("meta.title is required.");
    if (!isText(meta.disclaimer)) errors.push("meta.disclaimer is required.");
    if (!meta.emergency || !isText(meta.emergency.number)) {
      errors.push("meta.emergency.number is required.");
    }
    if (!Array.isArray(meta.officialSources) || meta.officialSources.length === 0) {
      errors.push("meta.officialSources must contain at least one source.");
    } else {
      meta.officialSources.forEach((source, index) => {
        if (!isText(source.label)) {
          errors.push(`meta.officialSources[${index}].label is required.`);
        }
        if (!isOfficialUrl(source.url)) {
          errors.push(`meta.officialSources[${index}].url must be an official https link.`);
        }
      });
    }
  }

  if (!Array.isArray(content.scenarios)) {
    errors.push("scenarios must be an array.");
    return errors;
  }

  if (content.scenarios.length !== REQUIRED_SCENARIO_IDS.length) {
    errors.push(`Expected ${REQUIRED_SCENARIO_IDS.length} scenarios, found ${content.scenarios.length}.`);
  }

  const scenarioIds = new Set();
  const questionIds = new Set();

  content.scenarios.forEach((scenario, scenarioIndex) => {
    const path = `scenarios[${scenarioIndex}]`;
    if (!scenario || typeof scenario !== "object") {
      errors.push(`${path} must be an object.`);
      return;
    }

    for (const field of ["id", "number", "title", "kicker", "summary", "setting", "fieldNote"]) {
      if (!isText(scenario[field])) errors.push(`${path}.${field} is required.`);
    }

    if (isText(scenario.id)) {
      if (scenarioIds.has(scenario.id)) errors.push(`${path}.id is duplicated.`);
      scenarioIds.add(scenario.id);
    }

    if (!Array.isArray(scenario.takeaways) || scenario.takeaways.length === 0) {
      errors.push(`${path}.takeaways must contain at least one item.`);
    }

    if (!Array.isArray(scenario.questions) || scenario.questions.length !== QUESTIONS_PER_SCENARIO) {
      errors.push(`${path}.questions must contain exactly ${QUESTIONS_PER_SCENARIO} questions.`);
      return;
    }

    scenario.questions.forEach((question, questionIndex) => {
      const qPath = `${path}.questions[${questionIndex}]`;
      if (!question || typeof question !== "object") {
        errors.push(`${qPath} must be an object.`);
        return;
      }

      for (const field of ["id", "shortLabel", "prompt", "explanation"]) {
        if (!isText(question[field])) errors.push(`${qPath}.${field} is required.`);
      }

      if (isText(question.id)) {
        if (questionIds.has(question.id)) errors.push(`${qPath}.id is duplicated.`);
        questionIds.add(question.id);
      }

      if (!Array.isArray(question.options) || question.options.length !== OPTIONS_PER_QUESTION) {
        errors.push(`${qPath}.options must contain exactly ${OPTIONS_PER_QUESTION} options.`);
      } else {
        const optionIds = new Set();
        question.options.forEach((option, optionIndex) => {
          if (!option || !isText(option.id) || !isText(option.text)) {
            errors.push(`${qPath}.options[${optionIndex}] needs an id and text.`);
            return;
          }
          if (optionIds.has(option.id)) {
            errors.push(`${qPath}.options[${optionIndex}].id is duplicated.`);
          }
          optionIds.add(option.id);
        });

        if (!optionIds.has(question.correctOptionId)) {
          errors.push(`${qPath}.correctOptionId must match one option id.`);
        }
      }

      if (!Array.isArray(question.sources) || question.sources.length === 0) {
        errors.push(`${qPath}.sources must contain at least one official link.`);
      } else {
        question.sources.forEach((source, sourceIndex) => {
          if (!isText(source.label)) {
            errors.push(`${qPath}.sources[${sourceIndex}].label is required.`);
          }
          if (!isOfficialUrl(source.url)) {
            errors.push(`${qPath}.sources[${sourceIndex}].url must be an official https link.`);
          }
        });
      }
    });
  });

  for (const id of REQUIRED_SCENARIO_IDS) {
    if (!scenarioIds.has(id)) errors.push(`Required scenario "${id}" is missing.`);
  }

  return errors;
}

export function getScenario(content, scenarioId) {
  return content.scenarios.find((scenario) => scenario.id === scenarioId) ?? null;
}

export function createSession(scenarioId) {
  return {
    scenarioId,
    currentIndex: 0,
    answers: [],
    score: 0,
    complete: false
  };
}

export function getCurrentQuestion(session, scenario) {
  return scenario.questions[session.currentIndex] ?? null;
}

export function getCurrentAnswer(session) {
  const question = session.currentIndex;
  return session.answers.find((answer) => answer.questionIndex === question) ?? null;
}

export function answerQuestion(session, scenario, optionId) {
  if (session.complete) {
    throw new Error("This scenario is already complete.");
  }

  const question = getCurrentQuestion(session, scenario);
  if (!question) {
    throw new Error("There is no current question.");
  }

  if (session.answers.some((answer) => answer.questionId === question.id)) {
    throw new Error("This question has already been answered.");
  }

  const selectedOption = question.options.find((option) => option.id === optionId);
  if (!selectedOption) {
    throw new Error("The selected option does not exist.");
  }

  const isCorrect = optionId === question.correctOptionId;
  const answer = {
    questionId: question.id,
    questionIndex: session.currentIndex,
    selectedOptionId: selectedOption.id,
    correctOptionId: question.correctOptionId,
    isCorrect
  };

  const answers = [...session.answers, answer];
  return {
    ...session,
    answers,
    score: session.score + (isCorrect ? 1 : 0),
    complete: answers.length === scenario.questions.length
  };
}

export function advanceSession(session, scenario) {
  const answeredCurrent = getCurrentAnswer(session);
  if (!answeredCurrent) {
    throw new Error("Answer the current question before moving on.");
  }

  if (session.currentIndex >= scenario.questions.length - 1) {
    return { ...session, complete: true };
  }

  return { ...session, currentIndex: session.currentIndex + 1 };
}

export function summarizeSession(session, scenario) {
  const total = scenario.questions.length;
  const answers = scenario.questions.map((question) => {
    const answer = session.answers.find((item) => item.questionId === question.id) ?? null;
    const correctOption = question.options.find(
      (option) => option.id === question.correctOptionId
    );
    const selectedOption = answer
      ? question.options.find((option) => option.id === answer.selectedOptionId)
      : null;

    return {
      questionId: question.id,
      shortLabel: question.shortLabel,
      prompt: question.prompt,
      isCorrect: Boolean(answer?.isCorrect),
      answered: Boolean(answer),
      selectedText: selectedOption?.text ?? null,
      correctText: correctOption?.text ?? "",
      explanation: question.explanation
    };
  });

  return {
    score: session.score,
    total,
    percent: total === 0 ? 0 : Math.round((session.score / total) * 100),
    answers
  };
}

export function getResultMessage(score, total) {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio === 1) {
    return {
      title: "You read the warning signs.",
      message: "A clean sweep. You chose the safer move in every situation."
    };
  }
  if (ratio >= 0.67 || (total > 1 && score >= total - 1)) {
    return {
      title: "Strong decisions, one to sharpen.",
      message: "You have the right instincts. Review the decision that caught you out."
    };
  }
  if (ratio >= 0.33) {
    return {
      title: "A useful start. Keep practising.",
      message: "Some of these situations are counter-intuitive. Read the explanations and try again."
    };
  }
  return {
    title: "This is why we practise.",
    message: "The safest choice is often not the obvious one. Walk through the scenario again."
  };
}
