"use client";

import { useState, useEffect } from "react";

export function StatsCounter() {
  const [stats, setStats] = useState<{ approved: number; total: number } | null>(null);

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

  if (!stats || stats.approved === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-400">
      <span className="font-bold">{stats.approved}</span>
      <span>TOKENS REGISTERED</span>
    </div>
  );
}

