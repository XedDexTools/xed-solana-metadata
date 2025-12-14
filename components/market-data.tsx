"use client";

import { useEffect, useState, useCallback } from "react";

type MarketDataProps = {
  mint: string;
};

type DexData = {
  price: number | null;
  priceChange24h: number | null;
  priceChange1h: number | null;
  volume24h: number | null;
  liquidity: number | null;
  marketCap: number | null;
  fdv: number | null;
  txns24h: { buys: number; sells: number } | null;
  dexUrl: string | null;
  pairAddress: string | null;
  dexId: string | null;
};

function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return "—";
  
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "—";
  
  if (price < 0.00001) {
    return `$${price.toExponential(2)}`;
  }
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  if (price < 1000) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPercent(percent: number | null): string {
  if (percent === null || percent === undefined) return "—";
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
  );
}

export function MarketData({ mint }: MarketDataProps) {
  const [data, setData] = useState<DexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/dexscreener?mint=${mint}`);
      if (!response.ok) throw new Error("Failed to fetch");
      
      const json = await response.json();
      setData(json.data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [mint]);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Check if we have any meaningful data
  const hasData = data && (data.price !== null || data.volume24h !== null || data.liquidity !== null);

  if (loading) {
    return (
      <div className="border border-white/10 bg-zinc-950 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-zinc-500">MARKET DATA</h2>
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-24 h-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !hasData) {
    return (
      <div className="border border-white/10 bg-zinc-950 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs text-zinc-500">MARKET DATA</h2>
        </div>
        <div className="text-center py-4">
          <p className="text-zinc-500 text-sm font-mono">
            {error ? "Failed to load market data" : "No DEX trading data available"}
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            This token may not be listed on any DEX yet
          </p>
        </div>
      </div>
    );
  }

  const priceChange = data.priceChange24h;
  const isPositive = priceChange !== null && priceChange >= 0;

  return (
    <div className="border border-white/10 bg-zinc-950 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-xs text-zinc-500">MARKET DATA</h2>
        {data.dexId && (
          <span className="text-xs font-mono text-zinc-600 uppercase">
            via {data.dexId}
          </span>
        )}
      </div>

      {/* Price Header */}
      <div className="flex items-baseline gap-4 mb-6">
        <span className="text-3xl font-bold text-white">
          {formatPrice(data.price)}
        </span>
        {priceChange !== null && (
          <span
            className={`text-lg font-mono ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {formatPercent(priceChange)}
          </span>
        )}
        {data.priceChange1h !== null && (
          <span
            className={`text-sm font-mono ${
              data.priceChange1h >= 0 ? "text-green-400/70" : "text-red-400/70"
            }`}
          >
            {formatPercent(data.priceChange1h)} 1h
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">VOLUME 24H</div>
          <div className="text-lg font-semibold text-white">
            {formatNumber(data.volume24h)}
          </div>
        </div>

        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">LIQUIDITY</div>
          <div className="text-lg font-semibold text-white">
            {formatNumber(data.liquidity)}
          </div>
        </div>

        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">MARKET CAP</div>
          <div className="text-lg font-semibold text-white">
            {formatNumber(data.marketCap)}
          </div>
        </div>

        <div>
          <div className="text-xs font-mono text-zinc-500 mb-1">FDV</div>
          <div className="text-lg font-semibold text-white">
            {formatNumber(data.fdv)}
          </div>
        </div>

        {data.txns24h && (
          <div>
            <div className="text-xs font-mono text-zinc-500 mb-1">TXNS 24H</div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-mono text-sm">
                {data.txns24h.buys.toLocaleString()} B
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-red-400 font-mono text-sm">
                {data.txns24h.sells.toLocaleString()} S
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DexScreener Link */}
      {data.dexUrl && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <a
            href={data.dexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View chart on DexScreener
          </a>
        </div>
      )}
    </div>
  );
}

