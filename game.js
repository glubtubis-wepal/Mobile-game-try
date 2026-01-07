const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =========================
   SPRITE SHEET CONFIG
   🔧 CHANGE THESE TWO NUMBERS
========================= */
const SPRITE = {
  columns: 8,   // frames across
  rows: 2,      // frames down
  frameSpeed: 6 // lower = faster
};

/* =========================
   IMAGES
========================= */
const playerImg = new Image();
playerImg.src = "player.png";

const bgFar = new Image();
bgFar.src = "bg_far.png";
const bgMid = new Image();
bgMid.src = "bg_mid.png";
const bgNear = new Image();
bgNear.src = "bg_near.png";

/* =========================
   PLAYER
========================= */
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

/* =========================
   WORLD
========================= */
const groundY = canvas.height - 140;
const speed = 5;

/* =========================
   PARALLAX
========================= */
let bgX = { far: 0, mid: 0, near: 0 };

/* =========================
   SPRITE DATA (AUTO)
========================= */
let frameWidth = 0;
let frameHeight = 0;
let totalFrames = 0;

/* =========================
   TOUCH INPUT
========================= */
let startX = 0, startY = 0;

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // DASH
    player.x += dx > 0 ? 200 : -200;
  } else {
    if (dy < -60 && player.grounded) {
      // JUMP
      player.vy = player.jumpForce;
      player.grounded = false;
    }
    if (dy > 60) {
      // DOWN STRIKE
      player.vy = 28;
    }
  }
});

/* =========================
   UPDATE
========================= */
function update() {
  // Physics
  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Parallax
  bgX.far -= speed * 0.2;
  bgX.mid -= speed * 0.5;
  bgX.near -= speed;

  for (let k in bgX) {
    if (bgX[k] <= -canvas.width) bgX[k] = 0;
  }

  updateAnimation();
}

/* =========================
   ANIMATION (AUTO SAFE)
========================= */
function updateAnimation() {
  player.frameTimer++;
  if (player.frameTimer >= SPRITE.frameSpeed) {
    player.frame = (player.frame + 1) % totalFrames;
    player.frameTimer = 0;
  }
}

/* =========================
   DRAW
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBG(bgFar, bgX.far);
  drawBG(bgMid, bgX.mid);
  drawBG(bgNear, bgX.near);

  ctx.fillStyle = "#222";
  ctx.fillRect(0, groundY, canvas.width, 200);

  drawPlayer();
}

function drawBG(img, x) {
  ctx.drawImage(img, x, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x + canvas.width, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  const col = player.frame % SPRITE.columns;
  const row = Math.floor(player.frame / SPRITE.columns);

  const sx = col * frameWidth;
  const sy = row * frameHeight;

  ctx.imageSmoothingEnabled = false; // IMPORTANT for PC sprites

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

/* =========================
   START (WAIT FOR IMAGE)
========================= */
playerImg.onload = () => {
  frameWidth = playerImg.width / SPRITE.columns;
  frameHeight = playerImg.height / SPRITE.rows;
  totalFrames = SPRITE.columns * SPRITE.rows;

  // Scale DOWN PC sprite for mobile
  const scale = 0.35;
  player.width = frameWidth * scale;
  player.height = frameHeight * scale;

  player.y = groundY - player.height;

  requestAnimationFrame(loop);
};

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
