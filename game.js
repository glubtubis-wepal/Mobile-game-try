const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =====================
   SPRITE SETTINGS
   🔧 CHANGE THESE ONLY
===================== */
const SPRITE = {
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 8,
  frameSpeed: 6,
  direction: "horizontal" // "horizontal" OR "vertical"
};

/* =====================
   IMAGES
===================== */
const playerImg = new Image();
playerImg.src = "player.png";

const bgFar = new Image();
bgFar.src = "bg_far.png";
const bgMid = new Image();
bgMid.src = "bg_mid.png";
const bgNear = new Image();
bgNear.src = "bg_near.png";

/* =====================
   PLAYER
===================== */
const player = {
  x: 120,
  y: 0,
  width: 80,
  height: 80,
  vy: 0,
  gravity: 0.9,
  jumpForce: -20,
  grounded: false,
  dashPower: 250,

  frame: 0,
  frameTimer: 0
};

/* =====================
   WORLD
===================== */
const groundY = canvas.height - 150;
const speed = 5;

/* =====================
   PARALLAX
===================== */
let bgX = { far: 0, mid: 0, near: 0 };

/* =====================
   TOUCH INPUT
===================== */
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
    player.x += dx > 0 ? player.dashPower : -player.dashPower;
  } else {
    if (dy < -60 && player.grounded) {
      // JUMP
      player.vy = player.jumpForce;
      player.grounded = false;
    }
    if (dy > 60) {
      // DOWN STRIKE
      player.vy = 25;
    }
  }
});

/* =====================
   UPDATE
===================== */
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

/* =====================
   ANIMATION (FIXED)
===================== */
function updateAnimation() {
  player.frameTimer++;
  if (player.frameTimer >= SPRITE.frameSpeed) {
    player.frame = (player.frame + 1) % SPRITE.frameCount;
    player.frameTimer = 0;
  }
}

/* =====================
   DRAW
===================== */
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
  let sx = 0;
  let sy = 0;

  if (SPRITE.direction === "horizontal") {
    sx = player.frame * SPRITE.frameWidth;
  } else {
    sy = player.frame * SPRITE.frameHeight;
  }

  ctx.drawImage(
    playerImg,
    sx,
    sy,
    SPRITE.frameWidth,
    SPRITE.frameHeight,
    player.x,
    player.y,
    player.width,
    player.height
  );
}

/* =====================
   LOOP (SAFE LOAD)
===================== */
playerImg.onload = () => {
  player.y = groundY - player.height;
  requestAnimationFrame(loop);
};

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
