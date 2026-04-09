"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Easier than classic flappy: slower pipes, wide gap, forgiving hitbox */
const GRAVITY = 0.26;
const JUMP = -5.1;
const PIPE_W = 52;
const PIPE_GAP = 172;
const PIPE_SPEED = 1.42;
const SPAWN_FRAMES = 130;
const BIRD_R = 14;
/** Collision uses smaller radius + narrower pipe zone */
const HIT_R = 8.5;
const PIPE_HIT_INSET_X = 14;
/** Extra clearance in the gap (px) — feels fairer on small screens */
const GAP_MARGIN = 12;

type Pipe = { x: number; gapY: number; passed: boolean };

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
    ctx.stroke();
    return;
  }
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  const s = scale;
  const blobs: [number, number, number][] = [
    [0, 0, 1],
    [-0.55, 0.05, 0.75],
    [0.55, 0, 0.8],
    [-0.25, -0.35, 0.55],
    [0.35, -0.3, 0.5],
  ];
  for (const [ox, oy, r] of blobs) {
    ctx.beginPath();
    ctx.arc(cx + ox * s * 28, cy + oy * s * 16, r * s * 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, wingUp: boolean) {
  ctx.save();
  ctx.fillStyle = "#fffbeb";
  ctx.strokeStyle = "#fbcfe8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fda4af";
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y + r * 0.15, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + r * 0.35, y + r * 0.15, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(x + r * 0.45, y - r * 0.2, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f472b6";
  ctx.beginPath();
  ctx.moveTo(x + r * 0.95, y);
  ctx.lineTo(x + r * 1.35, y - r * 0.12);
  ctx.lineTo(x + r * 1.35, y + r * 0.12);
  ctx.closePath();
  ctx.fill();
  const wy = wingUp ? -r * 0.35 : r * 0.1;
  ctx.fillStyle = "#fce7f3";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.5, y + wy, r * 0.55, r * 0.32, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fbcfe8";
  ctx.stroke();
  ctx.restore();
}

function drawPipe(
  ctx: CanvasRenderingContext2D,
  x: number,
  topH: number,
  botTop: number,
  botH: number,
  hueShift: number,
) {
  const r = 18;
  const main = hueShift > 0.5 ? "#c4b5fd" : "#a5b4fc";
  const light = hueShift > 0.5 ? "#ddd6fe" : "#c7d2fe";
  const dark = hueShift > 0.5 ? "#7c3aed" : "#6366f1";
  ctx.save();
  ctx.fillStyle = main;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  drawRoundRect(ctx, x, 0, PIPE_W, topH, r);
  ctx.fillStyle = light;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  const stripeW = 12;
  ctx.fillRect(x + PIPE_W * 0.35, 8, stripeW, Math.max(0, topH - 16));
  ctx.strokeRect(x + PIPE_W * 0.35, 8, stripeW, Math.max(0, topH - 16));
  ctx.fillStyle = main;
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  drawRoundRect(ctx, x, botTop, PIPE_W, botH, r);
  ctx.fillStyle = light;
  ctx.lineWidth = 2;
  ctx.fillRect(x + PIPE_W * 0.35, botTop + 8, stripeW, Math.max(0, botH - 16));
  ctx.strokeRect(x + PIPE_W * 0.35, botTop + 8, stripeW, Math.max(0, botH - 16));
  ctx.restore();
}

function GameWelcome({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col items-center justify-center px-6 pb-8 pt-4 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-8 top-[12%] h-24 w-24 rounded-full bg-pink-300/40 blur-xl" />
        <div className="absolute right-[-10%] top-[25%] h-32 w-32 rounded-full bg-violet-300/35 blur-xl" />
        <div className="absolute bottom-[20%] left-[20%] h-20 w-20 rounded-full bg-rose-300/40 blur-lg" />
      </div>
      <div className="relative mb-2 flex h-28 items-center justify-center">
        <span className="absolute text-6xl opacity-90">☁️</span>
        <span className="relative mt-6 text-5xl drop-shadow-md">🎈</span>
      </div>
      <h2 className="relative text-2xl font-extrabold tracking-tight text-pink-600">
        Ready to bounce?
      </h2>
      <p className="relative mt-3 max-w-65 text-sm font-medium leading-relaxed text-pink-900/70">
        Tap the screen to float up. Dodge the candy pillars!
      </p>
      <button
        type="button"
        onClick={onPlay}
        className="relative mt-10 h-14 min-w-50 rounded-full bg-linear-to-r from-pink-500 via-rose-500 to-fuchsia-500 px-10 text-lg font-bold text-white shadow-xl shadow-pink-400/45 transition hover:brightness-105 active:scale-95"
      >
        Play
      </button>
    </div>
  );
}

function FlappyRun({ runKey, onRestart }: { runKey: number; onRestart: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);
  const wingRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrap || !canvasEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const draw = ctx;

    let raf = 0;
    let frame = 0;
    let W = 320;
    let H = 400;
    const wrapEl = wrap;
    let birdX = W * 0.28;
    let birdY = H * 0.48;
    let birdVy = 0;
    const pipes: Pipe[] = [];
    gameOverRef.current = false;

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      const r = wrapEl.getBoundingClientRect();
      W = Math.max(240, Math.floor(r.width));
      H = Math.max(280, Math.floor(r.height));
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      c.width = Math.floor(W * dpr);
      c.height = Math.floor(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
      c.style.touchAction = "none";
      draw.setTransform(dpr, 0, 0, dpr, 0, 0);
      birdX = W * 0.28;
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapEl);

    let hueSeed = (runKey * 0.37) % 1;

    function spawnPipe() {
      const margin = 64;
      const gapY =
        margin +
        Math.random() * Math.max(12, H - margin * 2 - PIPE_GAP);
      pipes.push({ x: W + PIPE_W + 20, gapY, passed: false });
    }

    function endGame() {
      if (gameOverRef.current) return;
      gameOverRef.current = true;
      setGameOver(true);
    }

    function jump() {
      if (gameOverRef.current) return;
      birdVy = JUMP;
    }

    function tick() {
      frame += 1;
      wingRef.current = Math.sin(frame * 0.18);

      const g = draw.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#ffd6ec");
      g.addColorStop(0.45, "#fce7f3");
      g.addColorStop(1, "#e9d5ff");
      draw.fillStyle = g;
      draw.fillRect(0, 0, W, H);

      drawCloud(draw, W * 0.15, H * 0.18, 1);
      drawCloud(draw, W * 0.72, H * 0.12, 0.85);
      drawCloud(draw, W * 0.55, H * 0.72, 0.7);
      drawCloud(draw, W * 0.08, H * 0.65, 0.65);

      if (!gameOverRef.current) {
        birdVy += GRAVITY;
        birdY += birdVy;

        const grace = 72;
        if (frame === grace || (frame > grace + 50 && (frame - grace) % SPAWN_FRAMES === 0)) {
          spawnPipe();
        }

        for (const p of pipes) {
          p.x -= PIPE_SPEED;
        }
        while (pipes.length > 0 && pipes[0].x < -PIPE_W - 10) {
          pipes.shift();
        }

        if (birdY - HIT_R < 4 || birdY + HIT_R > H - 4) endGame();

        const px0 = birdX;
        const py0 = birdY;

        for (const p of pipes) {
          const topH = p.gapY;
          const botTop = p.gapY + PIPE_GAP;

          if (!p.passed && p.x + PIPE_W < px0 - HIT_R) {
            p.passed = true;
            setScore((s) => s + 1);
          }

          const pipeLeft = p.x + PIPE_HIT_INSET_X;
          const pipeRight = p.x + PIPE_W - PIPE_HIT_INSET_X;
          const inX = px0 + HIT_R > pipeLeft && px0 - HIT_R < pipeRight;
          if (inX) {
            if (
              py0 - HIT_R < topH - GAP_MARGIN ||
              py0 + HIT_R > botTop + GAP_MARGIN
            ) {
              endGame();
            }
          }
        }
      }

      for (const p of pipes) {
        const topH = p.gapY;
        const botTop = p.gapY + PIPE_GAP;
        const botH = H - botTop;
        hueSeed = (hueSeed + 0.17) % 1;
        drawPipe(draw, p.x, topH, botTop, botH, hueSeed);
      }

      const wingUp = wingRef.current > 0;
      drawBird(draw, birdX, birdY, BIRD_R, wingUp);

      raf = requestAnimationFrame(tick);
    }

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      jump();
    };

    canvasEl.addEventListener("pointerdown", onPointerDown);

    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvasEl.removeEventListener("pointerdown", onPointerDown);
    };
  }, [runKey]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-center px-4 pb-2 pt-1">
        <div className="supports-backdrop-filter:bg-white/55 flex items-center gap-2 rounded-full bg-white/75 px-5 py-2 text-sm font-bold text-pink-700 shadow-md shadow-pink-200/50 ring-1 ring-pink-200/80 backdrop-blur-md">
          <span className="text-pink-400">★</span>
          <span className="tabular-nums">{score}</span>
        </div>
      </div>
      <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden rounded-4xl ring-3 ring-white/90 shadow-inner shadow-pink-200/80">
        <canvas ref={canvasRef} className="block h-full w-full cursor-pointer touch-none" />
        {gameOver ? (
          <div className="absolute inset-0 flex items-center justify-center bg-pink-950/35 p-4 supports-backdrop-filter:backdrop-blur-xs">
            <div className="w-full max-w-70 rounded-3xl bg-white/95 p-6 text-center shadow-2xl shadow-pink-300/40 ring-2 ring-pink-200">
              <p className="text-4xl">🌟</p>
              <p className="mt-2 text-lg font-extrabold text-pink-600">Nice try!</p>
              <p className="mt-1 text-sm font-medium text-pink-900/60">
                You scored{" "}
                <span className="tabular-nums font-bold text-pink-600">{score}</span>
              </p>
              <button
                type="button"
                onClick={onRestart}
                className="mt-6 h-12 w-full rounded-2xl bg-linear-to-r from-pink-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-pink-400/40 transition active:scale-95"
              >
                Play again
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TapFlappy() {
  const [started, setStarted] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const restart = useCallback(() => {
    setRunKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const root = document.getElementById("taploop-game-root");
    void root?.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement && document.fullscreenElement === root) {
        void document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      id="taploop-game-root"
      className="fixed inset-0 z-300 flex flex-col bg-linear-to-b from-pink-200 via-pink-100 to-violet-100 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
    >
      <header className="flex shrink-0 items-center justify-center px-4 pb-2 pt-2">
        <div className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold tracking-wide text-pink-600 shadow-sm ring-1 ring-pink-200/80 backdrop-blur-sm">
          TapLoop
        </div>
      </header>
      <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-3 pb-4">
        {!started ? (
          <GameWelcome onPlay={() => setStarted(true)} />
        ) : (
          <FlappyRun key={`${runKey}-wrap`} runKey={runKey} onRestart={restart} />
        )}
      </div>
    </div>
  );
}
