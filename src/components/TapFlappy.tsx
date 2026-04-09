"use client";

import { useEffect, useRef, useState } from "react";

const GRAVITY = 0.42;
const JUMP = -6.8;
const PIPE_W = 42;
const PIPE_GAP = 108;
const PIPE_SPEED = 2.6;
const SPAWN_FRAMES = 95;
const BIRD_R = 10;

type Pipe = { x: number; gapY: number; passed: boolean };

function FlappyRun({ onRestart }: { onRestart: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrap || !canvasEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    const draw = ctx;

    let raf = 0;
    let frame = 0;
    let W = 280;
    let H = 240;
    const wrapEl = wrap;
    let birdX = W * 0.28;
    let birdY = H * 0.45;
    let birdVy = 0;
    const pipes: Pipe[] = [];
    gameOverRef.current = false;

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      const r = wrapEl.getBoundingClientRect();
      W = Math.max(200, Math.floor(r.width));
      H = Math.floor(Math.min(280, W * 0.92));
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

    function spawnPipe() {
      const margin = 52;
      const gapY = margin + Math.random() * Math.max(8, H - margin * 2 - PIPE_GAP);
      pipes.push({ x: W + PIPE_W, gapY, passed: false });
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
      draw.fillStyle = "#18181b";
      draw.fillRect(0, 0, W, H);

      if (!gameOverRef.current) {
        birdVy += GRAVITY;
        birdY += birdVy;

        if (frame === 1 || (frame > 40 && frame % SPAWN_FRAMES === 0)) spawnPipe();

        for (const p of pipes) {
          p.x -= PIPE_SPEED;
        }
        while (pipes.length > 0 && pipes[0].x < -PIPE_W) {
          pipes.shift();
        }

        if (birdY - BIRD_R < 0 || birdY + BIRD_R > H) endGame();

        for (const p of pipes) {
          const topH = p.gapY;
          const botTop = p.gapY + PIPE_GAP;
          if (!p.passed && p.x + PIPE_W < birdX - BIRD_R) {
            p.passed = true;
            setScore((s) => s + 1);
          }
          if (
            birdX + BIRD_R > p.x &&
            birdX - BIRD_R < p.x + PIPE_W &&
            (birdY - BIRD_R < topH || birdY + BIRD_R > botTop)
          ) {
            endGame();
          }
        }
      }

      for (const p of pipes) {
        const topH = p.gapY;
        const botTop = p.gapY + PIPE_GAP;
        draw.fillStyle = "#52525b";
        draw.fillRect(p.x, 0, PIPE_W, topH);
        draw.fillRect(p.x, botTop, PIPE_W, H - botTop);
        draw.strokeStyle = "#71717a";
        draw.lineWidth = 2;
        draw.strokeRect(p.x, 0, PIPE_W, topH);
        draw.strokeRect(p.x, botTop, PIPE_W, H - botTop);
      }

      draw.fillStyle = "#fafafa";
      draw.beginPath();
      draw.arc(birdX, birdY, BIRD_R, 0, Math.PI * 2);
      draw.fill();
      draw.fillStyle = "#09090b";
      draw.beginPath();
      draw.arc(birdX + 3, birdY - 3, 2.5, 0, Math.PI * 2);
      draw.fill();

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
  }, []);

  return (
    <>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-xl ring-1 ring-zinc-700/80 bg-zinc-950"
      >
        <canvas ref={canvasRef} className="mx-auto block max-w-full cursor-pointer" />
        {gameOver ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/75">
            <p className="text-sm font-semibold text-zinc-200">Game over</p>
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-zinc-400">
          Score: <span className="tabular-nums text-zinc-200">{score}</span>
        </p>
        {gameOver ? (
          <button
            type="button"
            onClick={onRestart}
            className="h-9 shrink-0 rounded-lg bg-white px-4 text-xs font-semibold text-zinc-950 transition-transform hover:bg-zinc-100 active:scale-98"
          >
            Restart
          </button>
        ) : (
          <p className="text-[10px] text-zinc-600">Tap game to jump</p>
        )}
      </div>
    </>
  );
}

export function TapFlappy() {
  const [runId, setRunId] = useState(0);
  return (
    <div className="mt-4 w-full select-none">
      <FlappyRun key={runId} onRestart={() => setRunId((i) => i + 1)} />
    </div>
  );
}
