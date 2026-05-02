/*
  pRonptAI starter: ブロック崩しテンプレ
  まずは数字だけ変えて動かしてみてください。
*/

const { canvas, ctx, state, sleep } = api;

canvas.width = 480;
canvas.height = 360;

const paddle = { x: 190, y: 330, w: 100, h: 12, speed: 6 };
const ball = { x: 240, y: 200, r: 8, vx: 3, vy: -3 };
const blocks = [];
const rows = 4;
const cols = 7;
const blockW = 58;
const blockH = 18;
const gap = 8;
const topPad = 30;
const leftPad = 14;

let score = 0;
let alive = true;

for (let r = 0; r < rows; r += 1) {
  for (let c = 0; c < cols; c += 1) {
    blocks.push({
      x: leftPad + c * (blockW + gap),
      y: topPad + r * (blockH + gap),
      w: blockW,
      h: blockH,
      alive: true,
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();

  for (const b of blocks) {
    if (!b.alive) continue;
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  ctx.fillStyle = "#f8fafc";
  ctx.font = "14px sans-serif";
  ctx.fillText(`score: ${score}`, 12, 18);
}

function step() {
  if (state.keys["ArrowLeft"]) paddle.x -= paddle.speed;
  if (state.keys["ArrowRight"]) paddle.x += paddle.speed;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.vx *= -1;
  if (ball.y - ball.r < 0) ball.vy *= -1;

  // パドルとの当たり判定
  if (
    ball.y + ball.r > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.w &&
    ball.vy > 0
  ) {
    ball.vy *= -1;
  }

  for (const b of blocks) {
    if (!b.alive) continue;
    const hit =
      ball.x > b.x &&
      ball.x < b.x + b.w &&
      ball.y - ball.r < b.y + b.h &&
      ball.y + ball.r > b.y;
    if (hit) {
      b.alive = false;
      ball.vy *= -1;
      score += 10;
      break;
    }
  }

  if (ball.y - ball.r > canvas.height) {
    alive = false;
    console.log("GAME OVER");
  }

  if (blocks.every((b) => !b.alive)) {
    alive = false;
    console.log("CLEAR! score:", score);
  }
}

// Scratch 風: 「ずっと」= 停止ボタンで抜けるループ。終了条件は抜けるで。
ずっと {
  if (!alive) 抜ける;
  step();
  draw();
  await sleep(16);
}
