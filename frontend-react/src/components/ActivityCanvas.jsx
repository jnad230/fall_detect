import { useRef, useEffect } from "react";

const HISTORY = 100;

export default function ActivityCanvas({ magHistory, isFall }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;

    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth, h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(28,36,48,1)"; ctx.lineWidth = 1;

    [0.25, 0.5, 0.75].forEach(f => {
      ctx.beginPath(); ctx.moveTo(0, h * f); ctx.lineTo(w, h * f); ctx.stroke();
    });

    const ty = h - (2 / 5) * h;

    ctx.strokeStyle = "rgba(255,196,0,0.3)"; ctx.setLineDash([4, 4]);

    ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();

    ctx.setLineDash([]);

    const grad = ctx.createLinearGradient(0, 0, 0, h);

    grad.addColorStop(0, isFall ? "rgba(255,23,68,0.3)" : "rgba(0,230,118,0.2)");

    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();

    magHistory.forEach((v, i) => {
      const x = (i / (HISTORY - 1)) * w, y = h - Math.min(v / 5, 1) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();

    ctx.fillStyle = grad; ctx.fill();

    ctx.beginPath();

    ctx.strokeStyle = isFall ? "#ff1744" : "#00e676"; ctx.lineWidth = 2;

    magHistory.forEach((v, i) => {
      const x = (i / (HISTORY - 1)) * w, y = h - Math.min(v / 5, 1) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    ctx.stroke();

  }, [magHistory, isFall]);

  return <canvas ref={ref} />;
}