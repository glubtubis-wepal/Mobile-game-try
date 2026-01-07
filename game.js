/* ===============================
   CANVAS SETUP
================================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===============================
   SPRITE CONFIG
   🔧 CHANGE ONLY THIS
================================ */
const SPRITE_FRAMES = 9; // how many frames across your sprite
const FRAME_SPEED = 6;  // lower = faster animation

/* ===============================
   IMAGES
================================ */
const playerImg = new Image();
playerImg.src = "player.png";

const bgFar = new Image();
bgFar.src = "bg_far.png";
const bgMid = new Image();
bgMid.src = "bg_mid.png";
const bgNear = new Image();
bgNear.src = "bg_near.png";

/* ===============================
   PLAYER
================================ */
const player = {
  x: 120,
  y: 0,
  width: 0,
  height: 0,
  vy: 0,
  gravity: 1,
  jumpForce: -22,
  grounded: false,

  frame: 0,
  frameTimer: 0
};

/* ===============================
   WORLD
================================ */
const groundY = canvas.height - 140;
const runSpeed = 5;

/* ===============================
   PARALLAX
================================ */
let bgX = {
  far: 0,
  mid: 0,
  near: 0
};

/* ===============================
   SPRITE AUTO DATA
================================ */
let frameWidth = 0;
let frameHeight = 0;

/* ===============================
   TOUCH INPUT
================================ */
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;

  // DASH
  if (Math.abs(dx) > Math.abs(dy)) {
    player.x += dx > 0 ? 200 : -200;
    return;
  }

  // JUMP
  if (dy < -60 && player.grounded) {
    player.vy = player.jumpForce;
    player.grounded = false;
  }

  // DOWN STRIKE
  if (dy > 60) {
    player.vy = 30;
  }
});

/* ===============================
   UPDATE LOOP
================================ */
function update() {
  // Physics
  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Parallax movement
  bgX.far -= runSpeed * 0.2;
  bgX.mid -= runSpeed * 0.5;
  bgX.near -= runSpeed;

  for (let layer in bgX) {
    if (bgX[layer] <= -canvas.width) {
      bgX[layer] = 0;
    }
  }

  updateAnimation();
}

/* ===============================
   ANIMATION (FORCED LOOP)
================================ */
function updateAnimation() {
  player.frameTimer++;

  if (player.frameTimer >= FRAME_SPEED) {
    player.frame++;
    if (player.frame >= SPRITE_FRAMES) {
      player.frame = 0; // 🔒 HARD LOOP
    }
    player.frameTimer = 0;
  }
}

/* ===============================
   DRAW
================================ */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBG(bgFar, bgX.far);
  drawBG(bgMid, bgX.mid);
  drawBG(bgNear, bgX.near);

  // Ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, groundY, canvas.width, 200);

  drawPlayer();
}

function drawBG(img, x) {
  ctx.drawImage(img, x, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x + canvas.width, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  const sx = player.frame * frameWidth;
  const sy = 0;

  ctx.imageSmoothingEnabled = false; // important for PC sprites

  ctx.drawImage(
    playerImg,
    sx,
    sy,
    frameWidth,
    frameHeight,
    player.x,
    player.y,
    player.width,
    player.height
  );
}

/* ===============================
   START GAME (WAIT FOR SPRITE)
================================ */
playerImg.onload = () => {
  frameWidth = playerImg.width / SPRITE_FRAMES;
  frameHeight = playerImg.height;

  // Scale PC sprite down for mobile
  const scale = 0.35;
  player.width = frameWidth * scale;
  player.height = frameHeight * scale;

  player.y = groundY - player.height;

  requestAnimationFrame(gameLoop);
};

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
