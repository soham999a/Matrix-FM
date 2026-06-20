import { useRef, useEffect } from "react";
import { usePlayer } from "../contexts/PlayerContext";

const BAR_COUNT = 24;
const BAR_WIDTH = 4;
const BAR_GAP = 2;
const TOTAL_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;
const CANVAS_W = 320;
const CANVAS_H = 110;
const PEAK_DECAY = 0.92;
const MIN_VISIBLE = 0.05;

export function SpectrumAnalyser() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peaks = useRef(new Float32Array(BAR_COUNT));
  const rafId = useRef(0);
  const { player } = usePlayer();
  const { isPlaying, currentStation, getFrequencyData } = player;
  const analyserAvailable = !!getFrequencyData;

  useEffect(() => {
    if (!isPlaying || !currentStation || !getFrequencyData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = ctx;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = `${CANVAS_W}px`;
    canvas.style.height = `${CANVAS_H}px`;
    c.scale(dpr, dpr);

    const startX = (CANVAS_W - TOTAL_WIDTH) / 2;
    const palette = {
      gold: "#C9A84C",
      bone: "#F5F0EB",
      slate: "#6B6B6B",
      hairline: "#2A2A2A",
    };

    function draw() {
      rafId.current = requestAnimationFrame(draw);

      const data = getFrequencyData();
      c.clearRect(0, 0, CANVAS_W, CANVAS_H);
      if (!data) return;

      const binStep = data.length / BAR_COUNT;
      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        const startBin = Math.floor(i * binStep);
        const endBin = Math.floor((i + 1) * binStep);
        for (let j = startBin; j < endBin; j++) {
          sum += data[j] ?? 0;
        }
        const count = endBin - startBin || 1;
        const avg = sum / count / 255;
        const normalized = Math.max(MIN_VISIBLE, Math.min(1, avg * 1.2));

        if (normalized > peaks.current[i]) {
          peaks.current[i] = normalized;
        } else {
          peaks.current[i] *= PEAK_DECAY;
        }

        const barH = normalized * (CANVAS_H - 16);
        const peakY = CANVAS_H - 16 - peaks.current[i] * (CANVAS_H - 16);
        const x = startX + i * (BAR_WIDTH + BAR_GAP);
        const y = CANVAS_H - 16 - barH;

        const color = normalized > 0.65 ? palette.gold
          : normalized > 0.35 ? palette.bone
          : palette.slate;

        c.fillStyle = color;
        const radius = 2;
        if (barH > radius * 2) {
          c.beginPath();
          c.moveTo(x, y + radius);
          c.arcTo(x, y, x + radius, y, radius);
          c.lineTo(x + BAR_WIDTH - radius, y);
          c.arcTo(x + BAR_WIDTH, y, x + BAR_WIDTH, y + radius, radius);
          c.lineTo(x + BAR_WIDTH, CANVAS_H - 16);
          c.lineTo(x, CANVAS_H - 16);
          c.closePath();
          c.fill();
        }

        if (peaks.current[i] > MIN_VISIBLE * 2) {
          c.fillStyle = peaks.current[i] > 0.65 ? palette.gold : palette.bone;
          c.beginPath();
          c.arc(x + BAR_WIDTH / 2, peakY, 2, 0, Math.PI * 2);
          c.fill();
        }
      }

      c.strokeStyle = palette.hairline;
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(startX, CANVAS_H - 16);
      c.lineTo(startX + TOTAL_WIDTH, CANVAS_H - 16);
      c.stroke();
    }

    draw();

    draw();

    return () => {
      cancelAnimationFrame(rafId.current);
      peaks.current.fill(0);
    };
  }, [isPlaying, currentStation, getFrequencyData]);

  if (!isPlaying || !currentStation || !analyserAvailable) return null;

  return (
    <div className="flex justify-center w-full mb-grid-3">
      <canvas
        ref={canvasRef}
        className="block"
        aria-label="Audio spectrum analyser"
      />
    </div>
  );
}
