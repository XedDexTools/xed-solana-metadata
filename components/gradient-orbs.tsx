"use client";

import { useEffect, useState } from "react";

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color1: string;
  color2: string;
  duration: number;
  delay: number;
}

interface GradientOrbsProps {
  count?: number;
}

const colors = [
  ["#a855f7", "#6366f1"], // Purple to Indigo
  ["#3b82f6", "#06b6d4"], // Blue to Cyan
  ["#14b8a6", "#22c55e"], // Teal to Green
  ["#8b5cf6", "#ec4899"], // Violet to Pink
  ["#6366f1", "#8b5cf6"], // Indigo to Violet
];

export function GradientOrbs({ count = 4 }: GradientOrbsProps) {
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    const generated: Orb[] = [];
    for (let i = 0; i < count; i++) {
      const colorPair = colors[i % colors.length];
      generated.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
        size: 300 + Math.random() * 400,
        color1: colorPair[0],
        color2: colorPair[1],
        duration: 20 + Math.random() * 15,
        delay: i * 2,
      });
    }
    setOrbs(generated);
  }, [count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full blur-[100px] opacity-30"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color1} 0%, ${orb.color2} 50%, transparent 70%)`,
            animation: `orb-float-${orb.id} ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      <style jsx>{`
        ${orbs.map(
          (orb) => `
          @keyframes orb-float-${orb.id} {
            0%, 100% {
              transform: translate(-50%, -50%) translate(0, 0) scale(1);
            }
            25% {
              transform: translate(-50%, -50%) translate(${30 + Math.random() * 40}px, ${-30 - Math.random() * 40}px) scale(1.1);
            }
            50% {
              transform: translate(-50%, -50%) translate(${-20 - Math.random() * 30}px, ${20 + Math.random() * 30}px) scale(0.9);
            }
            75% {
              transform: translate(-50%, -50%) translate(${20 + Math.random() * 20}px, ${30 + Math.random() * 20}px) scale(1.05);
            }
          }
        `
        ).join("")}
      `}</style>
    </div>
  );
}
