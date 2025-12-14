"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceWidget } from "@/components/price-widget";
import { getWatchlist, removeFromWatchlist } from "@/components/watchlist-button";

type WatchlistItem = {
  mint: string;
  name: string;
  symbol: string;
  image?: string | null;
  addedAt: string;
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    if (typeof window !== "undefined") {
      return getWatchlist();
    }
    return [];
  });
  const [loading] = useState(false);

  const handleRemove = (mint: string) => {
    removeFromWatchlist(mint);
    setWatchlist(getWatchlist());
  };

  const clearAll = () => {
    if (confirm("Are you sure you want to clear your entire watchlist?")) {
      localStorage.removeItem("xed_watchlist");
      setWatchlist([]);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-20" />
      <div className="scanline" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
              <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
            </Link>
            <div className="hidden lg:block border-l border-white/10 pl-4">
              <PriceWidget />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explorer" className="text-sm text-zinc-400 hover:text-white transition-colors">Explorer</Link>
            <Link href="/start" className="text-sm text-zinc-400 hover:text-white transition-colors">Submit</Link>
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">YOUR WATCHLIST</h1>
              <p className="text-zinc-400">
                {watchlist.length} token{watchlist.length !== 1 ? "s" : ""} saved
              </p>
            </div>
            {watchlist.length > 0 && (
              <Button
                onClick={clearAll}
                variant="outline"
                className="h-9 px-4 rounded-none font-mono text-xs border-zinc-700 hover:bg-zinc-800"
              >
                CLEAR ALL
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-zinc-800 p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-1/3" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <div className="border border-zinc-800 bg-zinc-950 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">No tokens in your watchlist</h2>
              <p className="text-zinc-500 mb-6">
                Click the star icon on any token to add it to your watchlist
              </p>
              <Link href="/explorer">
                <Button className="h-10 px-6 bg-white text-black hover:bg-zinc-200 rounded-none font-bold text-xs">
                  EXPLORE TOKENS →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.map((item) => (
                <div
                  key={item.mint}
                  className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4 p-4">
                    <Link href={`/token/${item.mint}`} className="flex items-center gap-4 flex-1 min-w-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover bg-zinc-800"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-600">
                          {item.symbol.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold truncate">{item.name}</h3>
                          <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5">
                            ${item.symbol}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-600 truncate">{item.mint}</p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Link href={`/token/${item.mint}`}>
                        <Button
                          variant="outline"
                          className="h-8 px-3 rounded-none font-mono text-xs border-zinc-700 hover:bg-zinc-800"
                        >
                          VIEW
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleRemove(item.mint)}
                        className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Remove from watchlist"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="px-4 pb-3 flex items-center gap-4 text-xs text-zinc-600">
                    <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500 font-mono">
              💡 Your watchlist is stored locally in your browser. It will persist across sessions but won&apos;t sync across devices.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
