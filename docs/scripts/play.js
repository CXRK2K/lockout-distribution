const PROGRESS_KEY = "tcb-web-trial-progress-v1";

const CATEGORY_LABELS = {
  arts_entertainment: "Arts & Entertainment",
  current_events: "Current Events",
  language_literature: "Language & Literature",
  mathematics: "Mathematics",
  pop_culture_sports: "Pop Culture & Sports",
  potpourri: "Potpourri",
  science_technology: "Science & Technology",
  social_studies: "Social Studies",
};

const state = {
  trial: null,
  progress: { completedMatches: [] },
  currentMatch: null,
  currentQuestionIndex: 0,
  playerScore: 0,
  cpuScore: 0,
  timerId: null,
  secondsRemaining: 0,
};

const elements = {
  packName: document.getElementById("pack-name"),
  publicQuestionCount: document.getElementById("public-question-count"),
  trialProgress: document.getElementById("trial-progress"),
  trialNotice: document.getElementById("trial-notice"),
  trialMatchGrid: document.getElementById("trial-match-grid"),
  gamePanel: document.getElementById("game-panel"),
  summaryPanel: document.getElementById("summary-panel"),
  playerScore: document.getElementById("player-score"),
  cpuScore: document.getElementById("cpu-score"),
  progressValue: document.getElementById("progress-value"),
  timerValue: document.getElementById("timer-value"),
  matchPill: document.getElementById("match-pill"),
  categoryPill: document.getElementById("category-pill"),
  cpuPill: document.getElementById("cpu-pill"),
  timerFill: document.getElementById("timer-fill"),
  questionTitle: document.getElementById("question-title"),
  questionText: document.getElementById("question-text"),
  answerForm: document.getElementById("answer-form"),
  answerInput: document.getElementById("answer-input"),
  skipQuestion: document.getElementById("skip-question"),
  choiceGrid: document.getElementById("choice-grid"),
  feedback: document.getElementById("feedback"),
  feedbackTitle: document.getElementById("feedback-title"),
  feedbackCopy: document.getElementById("feedback-copy"),
  feedbackPrimary: document.getElementById("feedback-primary"),
  feedbackSecondary: document.getElementById("feedback-secondary"),
  summaryScore: document.getElementById("summary-score"),
  summaryCopy: document.getElementById("summary-copy"),
  summaryCorrect: document.getElementById("summary-correct"),
  summaryBonus: document.getElementById("summary-bonus"),
  summaryStreak: document.getElementById("summary-streak"),
  restartGame: document.getElementById("restart-game"),
};

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{"completedMatches":[]}');
    if (Array.isArray(parsed.completedMatches)) {
      return parsed;
    }
  } catch (error) {
    console.error(error);
  }

  return { completedMatches: [] };
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
}

function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9/]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isCorrect(userAnswer, acceptedAnswers) {
  const normalizedUser = normalizeAnswer(userAnswer);
  const compactUser = normalizedUser.replace(/\s+/g, "");

  return acceptedAnswers.some((answer) => {
    const normalizedAnswer = normalizeAnswer(answer);
    return normalizedUser === normalizedAnswer || compactUser === normalizedAnswer.replace(/\s+/g, "");
  });
}

function resetTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateHud() {
  const totalQuestions = state.currentMatch?.questions?.length ?? 0;
  elements.playerScore.textContent = String(state.playerScore);
  elements.cpuScore.textContent = String(state.cpuScore);
  elements.progressValue.textContent = totalQuestions ? `${state.currentQuestionIndex + 1} / ${totalQuestions}` : "0 / 0";
  elements.timerValue.textContent = `${state.secondsRemaining}s`;

  const baseTimer = state.currentMatch?.questionTimerSeconds ?? state.trial?.defaultQuestionTimerSeconds ?? 20;
  const width = `${Math.max(0, (state.secondsRemaining / baseTimer) * 100)}%`;
  elements.timerFill.style.width = width;
}

function startTimer(onExpire) {
  resetTimer();
  const baseTimer = state.currentMatch?.questionTimerSeconds ?? state.trial?.defaultQuestionTimerSeconds ?? 20;
  state.secondsRemaining = baseTimer;
  updateHud();

  state.timerId = window.setInterval(() => {
    state.secondsRemaining -= 1;
    updateHud();

    if (state.secondsRemaining <= 0) {
      resetTimer();
      onExpire();
    }
  }, 1000);
}

function currentQuestion() {
  return state.currentMatch.questions[state.currentQuestionIndex];
}

function setQuestionChrome(question) {
  elements.matchPill.textContent = state.currentMatch.title;
  elements.categoryPill.textContent = CATEGORY_LABELS[question.category] ?? question.category;
  elements.cpuPill.textContent = `CPU: ${state.currentMatch.cpuName}`;
  elements.questionTitle.textContent = `Round ${state.currentQuestionIndex + 1}`;
  elements.questionText.textContent = question.questionText;
}

function hideResponsePanels() {
  elements.feedback.hidden = true;
  elements.choiceGrid.hidden = true;
  elements.choiceGrid.innerHTML = "";
  elements.answerForm.hidden = false;
  elements.answerInput.value = "";
}

function renderChoices(question) {
  elements.answerForm.hidden = true;
  elements.choiceGrid.hidden = false;
  elements.choiceGrid.innerHTML = "";

  Object.entries(question.choices).forEach(([label, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
    button.addEventListener("click", () => resolveQuestion(value));
    elements.choiceGrid.append(button);
  });
}

function renderInputMode() {
  elements.choiceGrid.hidden = true;
  elements.answerForm.hidden = false;
  elements.answerInput.focus();
}

function showFeedback(kind, title, copy, onPrimary) {
  elements.feedback.hidden = false;
  elements.feedback.className = `feedback ${kind === "correct" ? "is-correct" : "is-wrong"}`;
  elements.feedbackTitle.textContent = title;
  elements.feedbackCopy.textContent = copy;
  elements.feedbackPrimary.textContent = state.currentQuestionIndex === state.currentMatch.questions.length - 1 ? "See Match Result" : "Next Question";
  elements.feedbackPrimary.onclick = onPrimary;
  elements.feedbackSecondary.hidden = true;
}

function buildCpuLine(question) {
  if (question.cpuCorrect) {
    return `${state.currentMatch.cpuName} answered correctly and picked up ${question.points} points.`;
  }

  return `${state.currentMatch.cpuName} missed that one.`;
}

function goToNextQuestion() {
  state.currentQuestionIndex += 1;

  if (state.currentQuestionIndex >= state.currentMatch.questions.length) {
    finishMatch();
    return;
  }

  renderQuestion();
}

function resolveQuestion(playerAnswer, timedOut = false) {
  const question = currentQuestion();
  const accepted = [...(question.acceptedAnswers ?? []), question.answer].filter(Boolean);
  const playerCorrect = !timedOut && isCorrect(playerAnswer, accepted);

  resetTimer();

  if (playerCorrect) {
    state.playerScore += question.points;
  }
  if (question.cpuCorrect) {
    state.cpuScore += question.points;
  }

  updateHud();

  const leadLine =
    state.playerScore === state.cpuScore
      ? "The match is tied."
      : state.playerScore > state.cpuScore
        ? "You are in front."
        : `${state.currentMatch.cpuName} is ahead.`;

  showFeedback(
    playerCorrect ? "correct" : "wrong",
    playerCorrect ? "You scored" : timedOut ? "Time expired" : "No points for you on that one",
    `${playerCorrect ? `Correct answer: ${question.answer}.` : `Correct answer: ${question.answer}.`} ${buildCpuLine(question)} ${leadLine}`,
    goToNextQuestion,
  );
}

function renderQuestion() {
  const question = currentQuestion();
  hideResponsePanels();
  setQuestionChrome(question);
  updateHud();

  if (question.choices) {
    renderChoices(question);
  } else {
    renderInputMode();
  }

  startTimer(() => resolveQuestion("", true));
}

function completedCount() {
  return state.progress.completedMatches.length;
}

function allMatchesUsed() {
  return completedCount() >= (state.trial?.matchesAllowed ?? 3);
}

function updateTrialSummary() {
  const allowed = state.trial?.matchesAllowed ?? 3;
  elements.trialProgress.textContent = `${completedCount()} / ${allowed} trial matches used`;

  if (allMatchesUsed()) {
    elements.trialNotice.textContent = "All 3 free solo-vs-CPU matches have been used on this browser. The desktop app unlocks the full experience.";
  } else {
    elements.trialNotice.textContent = "This web trial includes exactly 3 curated solo-vs-CPU matches. Each match uses its own distinct question set.";
  }
}

function renderTrialCards() {
  elements.trialMatchGrid.innerHTML = state.trial.matches
    .map((match, index) => {
      const completed = state.progress.completedMatches.includes(match.id);
      const locked = completed || allMatchesUsed();
      const status = completed ? "Completed" : locked ? "Locked" : "Available";

      return `
        <article class="trial-card ${completed ? "trial-card-complete" : ""}">
          <span class="trial-card-index">Match ${index + 1}</span>
          <h3>${match.title}</h3>
          <p>${match.description}</p>
          <div class="trial-card-meta">
            <span>${match.cpuName}</span>
            <span>${match.questions.length} questions</span>
          </div>
          <div class="trial-card-meta">
            <span>${match.cpuStyle}</span>
            <span>${status}</span>
          </div>
          <button class="button ${completed ? "button-secondary" : "button-primary"}" type="button" data-match-id="${match.id}" ${locked ? "disabled" : ""}>
            ${completed ? "Already Played" : locked ? "Trial Locked" : "Play This Match"}
          </button>
        </article>
      `;
    })
    .join("");

  elements.trialMatchGrid.querySelectorAll("[data-match-id]").forEach((button) => {
    button.addEventListener("click", () => {
      startMatch(button.dataset.matchId);
    });
  });
}

function finishMatch() {
  resetTimer();
  elements.gamePanel.hidden = true;
  elements.summaryPanel.hidden = false;

  if (!state.progress.completedMatches.includes(state.currentMatch.id)) {
    state.progress.completedMatches.push(state.currentMatch.id);
    saveProgress();
  }

  const winnerCopy =
    state.playerScore === state.cpuScore
      ? "This trial match finished tied."
      : state.playerScore > state.cpuScore
        ? `You beat ${state.currentMatch.cpuName}.`
        : `${state.currentMatch.cpuName} took the match.`;

  elements.summaryScore.textContent = `${state.playerScore} - ${state.cpuScore}`;
  elements.summaryCopy.textContent = `${winnerCopy} You have used ${completedCount()} of ${state.trial.matchesAllowed} free trial matches on this browser.`;
  elements.summaryCorrect.textContent = `${state.playerScore} pts`;
  elements.summaryBonus.textContent = `${state.cpuScore} pts`;
  elements.summaryStreak.textContent = state.currentMatch.cpuName;

  updateTrialSummary();
  renderTrialCards();
}

function startMatch(matchId) {
  const match = state.trial.matches.find((entry) => entry.id === matchId);
  if (!match) {
    return;
  }

  state.currentMatch = match;
  state.currentQuestionIndex = 0;
  state.playerScore = 0;
  state.cpuScore = 0;
  state.secondsRemaining = match.questionTimerSeconds ?? state.trial.defaultQuestionTimerSeconds ?? 20;

  elements.summaryPanel.hidden = true;
  elements.gamePanel.hidden = false;
  renderQuestion();
}

async function loadTrialDatabase() {
  const response = await fetch("../data/trial-preview.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load trial preview data: ${response.status}`);
  }
  return response.json();
}

function bindEvents() {
  elements.answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.answerInput.value.trim();
    if (!value) {
      return;
    }
    resolveQuestion(value);
  });

  elements.skipQuestion.addEventListener("click", () => resolveQuestion("", true));
  elements.restartGame.addEventListener("click", () => {
    elements.summaryPanel.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    state.trial = await loadTrialDatabase();
    state.progress = loadProgress();

    elements.packName.textContent = state.trial.title;
    elements.publicQuestionCount.textContent = String(
      state.trial.matches.reduce((total, match) => total + match.questions.length, 0),
    );

    updateTrialSummary();
    renderTrialCards();
    bindEvents();
  } catch (error) {
    console.error(error);
    elements.packName.textContent = "Unavailable";
    elements.publicQuestionCount.textContent = "0";
    elements.trialNotice.textContent = "The trial database could not be loaded.";
  }
});
