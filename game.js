const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* =====================
   ASSETS
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
  x: 100,
  y: canvas.height - 220,
  width: 64,
  height: 64,
  vy: 0,
  gravity: 0.8,
  jumpForce: -18,
  grounded: true,
  dashSpeed: 18,
  frame: 0,
  frameTimer: 0
};

/* =====================
   WORLD
===================== */
let groundY = canvas.height - 150;
let speed = 5;

/* =====================
   PARALLAX
===================== */
let bgX = {
  far: 0,
  mid: 0,
  near: 0
};

/* =====================
   TOUCH INPUT
===================== */
let touchStart = { x: 0, y: 0 };

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  touchStart.x = t.clientX;
  touchStart.y = t.clientY;
});

canvas.addEventListener("touchend", e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    // DASH
    player.x += dx > 0 ? player.dashSpeed * 10 : -player.dashSpeed * 10;
  } else {
    if (dy < -50 && player.grounded) {
      // JUMP
      player.vy = player.jumpForce;
      player.grounded = false;
    }
    if (dy > 50) {
      // DOWN STRIKE
      player.vy = 25;
    }
  }
});

/* =====================
   UPDATE
===================== */
function update() {
  // Player physics
  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  // Parallax movement
  bgX.far -= speed * 0.2;
  bgX.mid -= speed * 0.5;
  bgX.near -= speed;

  if (bgX.far <= -canvas.width) bgX.far = 0;
  if (bgX.mid <= -canvas.width) bgX.mid = 0;
  if (bgX.near <= -canvas.width) bgX.near = 0;

  // Animation
  player.frameTimer++;
  if (player.frameTimer > 6) {
    player.frame = (player.frame + 1) % 6; // 6-frame sprite
    player.frameTimer = 0;
  }
}

/* =====================
   DRAW
===================== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background layers
  drawParallax(bgFar, bgX.far);
  drawParallax(bgMid, bgX.mid);
  drawParallax(bgNear, bgX.near);

  // Ground
  ctx.fillStyle = "#333";
  ctx.fillRect(0, groundY, canvas.width, 200);

  // Player sprite animation
  ctx.drawImage(
    playerImg,
    player.frame * 64, 0, 64, 64,
    player.x, player.y,
    player.width, player.height
  );
}

function drawParallax(img, x) {
  ctx.drawImage(img, x, 0, canvas.width, canvas.height);
  ctx.drawImage(img, x + canvas.width, 0, canvas.width, canvas.height);
}

/* =====================
   GAME LOOP
===================== */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
