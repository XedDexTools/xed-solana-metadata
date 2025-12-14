"use client";

import { ReactNode, useState } from "react";

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glowColor?: string;
  variant?: "primary" | "secondary";
}

export function GlowButton({
  children,
  className = "",
  onClick,
  glowColor = "rgba(168, 85, 247, 0.5)",
  variant = "primary",
}: GlowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = variant === "primary"
    ? "bg-white text-black hover:bg-zinc-100"
    : "bg-transparent text-white border border-white/20 hover:bg-white/5";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative font-bold tracking-widest transition-all duration-300 ${baseStyles} ${className}`}
      style={{
        boxShadow: isHovered
          ? `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, inset 0 0 30px rgba(255,255,255,0.1)`
          : "none",
      }}
    >
      {/* Animated border gradient */}
      {isHovered && (
        <span
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
            backgroundSize: "200% 100%",
            animation: "border-glow 2s linear infinite",
            opacity: 0.5,
            filter: "blur(8px)",
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
