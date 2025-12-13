"use client";

import { useState, useEffect } from "react";

type Props = {
  mint: string;
  name: string;
  symbol: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

type WatchlistItem = {
  mint: string;
  name: string;
  symbol: string;
  image?: string | null;
  addedAt: string;
};

const STORAGE_KEY = "xed_watchlist";

export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isInWatchlist(mint: string): boolean {
  return getWatchlist().some((item) => item.mint === mint);
}

export function addToWatchlist(item: Omit<WatchlistItem, "addedAt">): void {
  const watchlist = getWatchlist();
  if (!watchlist.some((i) => i.mint === item.mint)) {
    watchlist.unshift({ ...item, addedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }
}

export function removeFromWatchlist(mint: string): void {
  const watchlist = getWatchlist().filter((item) => item.mint !== mint);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
}

export function WatchlistButton({ mint, name, symbol, image, size = "md", showLabel = false }: Props) {
  const [isWatched, setIsWatched] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setIsWatched(isInWatchlist(mint));
  }, [mint]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWatched) {
      removeFromWatchlist(mint);
      setIsWatched(false);
    } else {
      addToWatchlist({ mint, name, symbol, image });
      setIsWatched(true);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 300);
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center gap-1.5
        ${showLabel ? "w-auto px-3" : ""}
        rounded transition-all
        ${isWatched 
          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        }
        ${animate ? "scale-125" : "scale-100"}
      `}
      title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <svg
        className={`${iconSizes[size]} transition-transform ${animate ? "scale-110" : ""}`}
        viewBox="0 0 24 24"
        fill={isWatched ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {showLabel && (
        <span className="text-xs font-mono">
          {isWatched ? "WATCHING" : "WATCH"}
        </span>
      )}
    </button>
  );
}
