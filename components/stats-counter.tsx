"use client";

import { useState, useEffect, useRef } from "react";

function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === 0) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
}

export function StatsCounter() {
  const [stats, setStats] = useState<{ approved: number; total: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!stats || stats.approved === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400 glow-blue"
    >
      <span className="font-bold">
        {isVisible ? <AnimatedNumber value={stats.approved} /> : 0}
      </span>
      <span>TOKENS REGISTERED</span>
    </div>
  );
}
