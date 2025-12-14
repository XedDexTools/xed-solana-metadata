"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return "translateY(40px)";
      case "down":
        return "translateY(-40px)";
      case "left":
        return "translateX(40px)";
      case "right":
        return "translateX(-40px)";
      case "fade":
        return "translateY(0)";
      default:
        return "translateY(40px)";
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0) translateX(0)" : getInitialTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}
