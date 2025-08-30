
// DOM Elements
const boardContainer = document.getElementById("board");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const boardSizeSelect = document.getElementById("boardSize");
const aiToggle = document.getElementById("aiToggle");
const themeToggle = document.getElementById("themeToggle");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");

// Game State
let boardSize = 3;
let board = [];
let currentPlayer = "X";
let gameActive = true;
let aiEnabled = false;
let history = [];
let future = [];
let scores = { X: 0, O: 0, Draw: 0 };

// Utility
function getWinPatterns(size) {
  const patterns = [];
  // Rows
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) row.push(r * size + c);
    patterns.push(row);
  }
  // Columns
  for (let c = 0; c < size; c++) {
    const col = [];
    for (let r = 0; r < size; r++) col.push(r * size + c);
    patterns.push(col);
  }
  // Diagonal
  const diag1 = [], diag2 = [];
  for (let i = 0; i < size; i++) {
    diag1.push(i * size + i);
    diag2.push(i * size + (size - i - 1));
  }
  patterns.push(diag1, diag2);
  return patterns;
}

function renderBoard() {
  boardContainer.innerHTML = "";
  boardContainer.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  for (let i = 0; i < board.length; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.textContent = board[i];
    if (board[i]) cell.classList.add("animated");
    cell.addEventListener("click", handleClick);
    boardContainer.appendChild(cell);
  }
}

function updateStatus(text) {
  statusText.textContent = text;
}

function updateScores() {
  scoreX.textContent = `X: ${scores.X}`;
  scoreO.textContent = `O: ${scores.O}`;
  scoreDraw.textContent = `Draws: ${scores.Draw}`;
}

function playSound(type) {
  if (type === "move") moveSound && moveSound.play();
  if (type === "win") winSound && winSound.play();
}

function saveHistory() {
  history.push({ board: [...board], player: currentPlayer });
  if (history.length > 100) history.shift(); // limit history
  future = [];
}

function undoMove() {
  if (history.length < 2) return;
  future.push(history.pop());
  const last = history[history.length - 1];
  board = [...last.board];
  currentPlayer = last.player;
  gameActive = true;
  renderBoard();
  updateStatus(`Player ${currentPlayer}'s Turn`);
}

function redoMove() {
  if (!future.length) return;
  const next = future.pop();
  history.push(next);
  board = [...next.board];
  currentPlayer = next.player;
  renderBoard();
  updateStatus(`Player ${currentPlayer}'s Turn`);
}

function restartGame(resetScores = false) {
  board = Array(boardSize * boardSize).fill("");
  currentPlayer = "X";
  gameActive = true;
  history = [{ board: [...board], player: currentPlayer }];
  future = [];
  if (resetScores) scores = { X: 0, O: 0, Draw: 0 };
  renderBoard();
  updateStatus(`Player X's Turn`);
  updateScores();
}

function highlightWinner(pattern) {
  const cells = boardContainer.querySelectorAll(".cell");
  pattern.forEach(idx => {
    cells[idx].classList.add("winner");
  });
}

function checkWinner() {
  const patterns = getWinPatterns(boardSize);
  for (const pattern of patterns) {
    const first = board[pattern[0]];
    if (first && pattern.every(idx => board[idx] === first)) {
      highlightWinner(pattern);
      return first;
    }
  }
  return null;
}

function isDraw() {
  return board.every(cell => cell !== "");
}

function aiMove() {
  // Simple AI: random empty cell
  const empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  if (empty.length === 0) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  board[idx] = currentPlayer;
  playSound("move");
  renderBoard();
  saveHistory();
  const winner = checkWinner();
  if (winner) {
    updateStatus(`🎉 Player ${winner} Wins! 🎉`);
    scores[winner]++;
    updateScores();
    playSound("win");
    gameActive = false;
    return;
  }
  if (isDraw()) {
    updateStatus("😎 It's a Draw!");
    scores.Draw++;
    updateScores();
    gameActive = false;
    return;
  }
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${currentPlayer}'s Turn`);
}

function handleClick(e) {
  const index = +e.target.dataset.index;
  if (board[index] !== "" || !gameActive) return;
  board[index] = currentPlayer;
  playSound("move");
  renderBoard();
  saveHistory();
  const winner = checkWinner();
  if (winner) {
    updateStatus(`🎉 Player ${winner} Wins! 🎉`);
    scores[winner]++;
    updateScores();
    playSound("win");
    gameActive = false;
    return;
  }
  if (isDraw()) {
    updateStatus("😎 It's a Draw!");
    scores.Draw++;
    updateScores();
    gameActive = false;
    return;
  }
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${currentPlayer}'s Turn`);
  if (aiEnabled && gameActive && currentPlayer === "O") {
    setTimeout(aiMove, 400);
  }
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("light-theme");
});

// Board size change
boardSizeSelect.addEventListener("change", e => {
  boardSize = +e.target.value;
  restartGame(true);
});

// AI toggle
aiToggle.addEventListener("change", e => {
  aiEnabled = e.target.checked;
  restartGame();
});

// Undo/Redo
undoBtn.addEventListener("click", undoMove);
redoBtn.addEventListener("click", redoMove);

// Restart
restartBtn.addEventListener("click", () => restartGame());

// Initial setup
function init() {
  boardSize = +boardSizeSelect.value;
  aiEnabled = aiToggle.checked;
  restartGame(true);
}

window.onload = init;
