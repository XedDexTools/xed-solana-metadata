"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  id: string;
  type: "approved" | "submitted";
  name: string;
  symbol: string;
  mint: string;
  image: string | null;
  timestamp: string;
};

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch("/api/activity");
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
    // Poll every 30 seconds for new activity
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  function timeAgo(timestamp: string) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 animate-pulse">
            <div className="w-8 h-8 bg-zinc-800 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
              <div className="h-2 bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 font-mono text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <Link
          key={activity.id}
          href={`/token/${activity.mint}`}
          className={`flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors group ${
            index === 0 ? "bg-green-500/10 border border-green-500/20" : "bg-zinc-900/30"
          }`}
        >
          {activity.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activity.image}
              alt={activity.name}
              className="w-8 h-8 object-cover bg-zinc-800"
            />
          ) : (
            <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
              {activity.symbol.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate group-hover:text-white transition-colors">
                {activity.name}
              </span>
              <span className="text-xs font-mono text-zinc-500">${activity.symbol}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className={activity.type === "approved" ? "text-green-500" : "text-yellow-500"}>
                {activity.type === "approved" ? "✓ Approved" : "⏳ Submitted"}
              </span>
              <span>•</span>
              <span>{timeAgo(activity.timestamp)}</span>
            </div>
          </div>
          <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
        </Link>
      ))}
    </div>
  );
}
