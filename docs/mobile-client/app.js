'use strict';

// ── Constants ────────────────────────────────────────────────────────────────

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];
const CHOICE_CLASSES = ['choice-a', 'choice-b', 'choice-c', 'choice-d'];
const PLAYER_COLORS = ['#ff2d55','#00f0ff','#ffd60a','#bf5af2','#30d158','#ff9f0a','#64d2ff','#ff6961'];

// ── State ─────────────────────────────────────────────────────────────────────

let ws = null;
let playerName = localStorage.getItem('lockout_name') || '';
let myChoice = null;
let currentChoices = [];
let timerInterval = null;
let reconnectTimer = null;
let isConnected = false;

// ── Elements ──────────────────────────────────────────────────────────────────

const screens = {
  join:     document.getElementById('screen-join'),
  lobby:    document.getElementById('screen-lobby'),
  question: document.getElementById('screen-question'),
  locked:   document.getElementById('screen-locked'),
  reveal:   document.getElementById('screen-reveal'),
  gameover: document.getElementById('screen-gameover'),
};

const $ = id => document.getElementById(id);

// ── Screen control ────────────────────────────────────────────────────────────

function show(name) {
  Object.values(screens).forEach(s => s.hidden = true);
  screens[name].hidden = false;
}

// ── WebSocket ─────────────────────────────────────────────────────────────────

function connect() {
  clearTimeout(reconnectTimer);
  const wsUrl = `ws://${window.location.host}/ws`;

  try {
    ws = new WebSocket(wsUrl);
  } catch {
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    isConnected = true;
    setReconnectBar(false);
    if (playerName) {
      send({ type: 'join', name: playerName });
    }
  };

  ws.onmessage = e => {
    try {
      handleMessage(JSON.parse(e.data));
    } catch { /* ignore malformed */ }
  };

  ws.onclose = () => {
    isConnected = false;
    setReconnectBar(true);
    scheduleReconnect();
  };

  ws.onerror = () => ws.close();
}

function send(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function scheduleReconnect() {
  reconnectTimer = setTimeout(connect, 2500);
}

function setReconnectBar(visible) {
  let bar = document.getElementById('reconnect-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'reconnect-bar';
    bar.textContent = 'Reconnecting to room…';
    document.body.appendChild(bar);
  }
  bar.classList.toggle('visible', visible);
}

// ── Message handler ───────────────────────────────────────────────────────────

function handleMessage(msg) {
  switch (msg.type) {

    case 'joined':
      playerName = msg.name;
      localStorage.setItem('lockout_name', playerName);
      show('lobby');
      break;

    case 'lobby':
      renderLobby(msg.players || []);
      // Only switch to lobby if not in an active game screen
      if (!['question','locked','reveal'].includes(currentScreen())) {
        show('lobby');
      }
      break;

    case 'question':
      clearTimer();
      myChoice = null;
      currentChoices = msg.choices || [];
      renderQuestion(msg);
      show('question');
      startTimer(msg.time_limit || 30);
      break;

    case 'answer_locked':
      clearTimer();
      myChoice = msg.choice;
      $('locked-choice-label').textContent = `You picked ${CHOICE_LABELS[msg.choice]}: ${currentChoices[msg.choice] || ''}`;
      show('locked');
      break;

    case 'reveal':
      clearTimer();
      renderReveal(msg);
      show('reveal');
      break;

    case 'game_over':
      clearTimer();
      renderGameOver(msg.scores || []);
      show('gameover');
      break;

    case 'error':
      showJoinError(msg.message || 'Something went wrong.');
      break;
  }
}

// ── Renderers ─────────────────────────────────────────────────────────────────

function renderLobby(players) {
  const list = $('lobby-players');
  list.innerHTML = '';
  players.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'player-entry';
    const dot = document.createElement('div');
    dot.className = 'player-dot';
    dot.style.background = PLAYER_COLORS[i % PLAYER_COLORS.length];
    const name = document.createElement('span');
    name.textContent = p.name + (p.name === playerName ? ' (you)' : '');
    row.appendChild(dot);
    row.appendChild(name);
    list.appendChild(row);
  });
  $('lobby-sub').textContent = `${players.length} player${players.length !== 1 ? 's' : ''} in the room`;
}

function renderQuestion(msg) {
  $('q-counter').textContent = `Q ${msg.index} / ${msg.total}`;
  $('q-text').textContent = msg.text;

  const container = $('choices');
  container.innerHTML = '';

  msg.choices.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.className = `choice-btn ${CHOICE_CLASSES[i]}`;
    btn.innerHTML = `<span class="choice-letter">${CHOICE_LABELS[i]}</span>${escHtml(text)}`;
    btn.addEventListener('click', () => submitAnswer(i, btn));
    container.appendChild(btn);
  });
}

function renderReveal(msg) {
  const correct = msg.correct;
  const wasCorrect = msg.was_correct;

  $('reveal-verdict').textContent = wasCorrect ? '✓ Correct!' : '✗ Wrong';
  $('reveal-verdict').className = `reveal-verdict ${wasCorrect ? 'correct' : 'wrong'}`;
  $('reveal-delta').textContent = wasCorrect ? `+${msg.score_delta} pts` : '+0 pts';
  $('reveal-score').textContent = `Total: ${msg.total_score} pts`;

  const choicesEl = $('reveal-choices');
  choicesEl.innerHTML = '';
  (msg.choices_text || currentChoices).forEach((text, i) => {
    const row = document.createElement('div');
    const isCorrect = i === correct;
    const isMine = i === msg.your_choice;
    row.className = `reveal-choice ${isCorrect ? 'is-correct' : ''} ${isMine ? 'is-mine' : ''} ${isMine && !isCorrect ? 'is-wrong' : ''}`;
    row.innerHTML = `<strong>${CHOICE_LABELS[i]}</strong> ${escHtml(text)}${isCorrect ? ' ✓' : ''}`;
    choicesEl.appendChild(row);
  });

  renderLeaderboard('reveal-board', msg.scores || [], playerName);
}

function renderGameOver(scores) {
  renderLeaderboard('gameover-board', scores, playerName);
}

function renderLeaderboard(containerId, scores, myName) {
  const el = $(containerId);
  el.innerHTML = '';
  scores.forEach((entry, i) => {
    const row = document.createElement('div');
    const isMe = entry.name === myName;
    row.className = `lb-row ${isMe ? 'is-me' : ''}`;
    row.innerHTML = `
      <span class="lb-rank ${i < 3 ? 'top' : ''}">${i + 1}</span>
      <span class="lb-name">${escHtml(entry.name)}${isMe ? ' ●' : ''}</span>
      <span class="lb-score">${entry.score}</span>`;
    el.appendChild(row);
  });
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function startTimer(seconds) {
  const bar = $('timer-bar');
  bar.style.transition = 'none';
  bar.style.width = '100%';
  bar.classList.remove('urgent');

  let remaining = seconds;

  void bar.offsetWidth; // force reflow

  bar.style.transition = `width ${seconds}s linear`;
  bar.style.width = '0%';

  timerInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 5) bar.classList.add('urgent');
    if (remaining <= 0) clearTimer();
  }, 1000);
}

function clearTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

// ── Answer submission ─────────────────────────────────────────────────────────

function submitAnswer(index, btn) {
  clearTimer();
  // Disable all choice buttons immediately
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    b.style.opacity = b === btn ? '1' : '0.4';
  });
  if ('vibrate' in navigator) navigator.vibrate(80);
  send({ type: 'answer', choice: index });
  // Optimistic locked screen — server confirms with answer_locked
  myChoice = index;
  $('locked-choice-label').textContent = `You picked ${CHOICE_LABELS[index]}: ${currentChoices[index] || ''}`;
  show('locked');
}

// ── Join flow ─────────────────────────────────────────────────────────────────

function showJoinError(msg) {
  const el = $('join-error');
  el.textContent = msg;
  el.hidden = false;
  show('join');
}

$('name-input').value = playerName;

$('name-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') attemptJoin();
});

$('join-btn').addEventListener('click', attemptJoin);

function attemptJoin() {
  const name = $('name-input').value.trim();
  if (!name) {
    $('join-error').textContent = 'Enter a name first.';
    $('join-error').hidden = false;
    return;
  }
  $('join-error').hidden = true;
  playerName = name;
  localStorage.setItem('lockout_name', name);

  if (!isConnected) {
    connect();
    return;
  }
  send({ type: 'join', name });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function currentScreen() {
  for (const [name, el] of Object.entries(screens)) {
    if (!el.hidden) return name;
  }
  return 'join';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ──────────────────────────────────────────────────────────────────────

if (playerName) {
  show('lobby');
  $('lobby-title').textContent = `Welcome back, ${playerName}`;
}

connect();
