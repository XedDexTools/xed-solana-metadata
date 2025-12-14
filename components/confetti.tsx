"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "triangle";
}

interface ConfettiProps {
  trigger?: boolean;
  duration?: number;
  particleCount?: number;
}

export function Confetti({ trigger = true, duration = 3000, particleCount = 100 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
      "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
      "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1",
    ];

    const particles: Particle[] = [];

    // Create particles from center-top
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = Math.random() * 15 + 5;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: ["square", "circle", "triangle"][Math.floor(Math.random() * 3)] as Particle["shape"],
      });
    }

    let animationId: number;
    const startTime = Date.now();

    const draw = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.vy += 0.3; // gravity
        p.vx *= 0.99; // air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const opacity = Math.max(0, 1 - elapsed / duration);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "square") {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [trigger, duration, particleCount]);

  if (!trigger) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
