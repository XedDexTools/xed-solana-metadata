"use client";

import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  colors?: string[];
}

export function GradientText({
  children,
  className = "",
  animate = true,
  colors = ["#fff", "#a855f7", "#3b82f6", "#14b8a6", "#fff"],
}: GradientTextProps) {
  const gradientColors = colors.join(", ");

  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${gradientColors})`,
        backgroundSize: animate ? "200% auto" : "100% auto",
        animation: animate ? "gradient-shift 4s linear infinite" : "none",
      }}
    >
      {children}
    </span>
  );
}
