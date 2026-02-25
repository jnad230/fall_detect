import { useRef, useEffect } from "react";

export default function FallsCanvas({ fallEvents, sessionStart }) {
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

        ctx.fillStyle = "#4a5568"; ctx.font = "10px Space Mono";

        ctx.fillText("5g", 4, 14);
        ctx.fillText("0g", 4, h - 4);

        if (!fallEvents.length) return;

        fallEvents.forEach((f, i) => {
            const spacing = (w - 40) / Math.max(fallEvents.length, 1);
            const x = 20 + i * spacing + spacing / 2;
            const magClamped = Math.max(f.mag - 1, 0);
            const y = h - Math.min(magClamped / 4, 1) * (h - 40) - 20;
            ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,23,68,0.15)"; ctx.fill();
            ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ff1744"; ctx.fill();
            ctx.fillStyle = "#e0e6ed"; ctx.font = "10px Space Mono";
            ctx.fillText(f.mag.toFixed(1) + "g", x + 8, y - 4);
        });

    }, [fallEvents, sessionStart]);

    return <canvas ref={ref} />;
}