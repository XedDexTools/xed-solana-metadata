"use client";

import { useEffect, useRef } from "react";

type ChartModalProps = {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
};

const SYMBOL_MAP: Record<string, string> = {
  SOL: "BINANCE:SOLUSDT",
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
};

const NAMES: Record<string, string> = {
  SOL: "Solana",
  BTC: "Bitcoin",
  ETH: "Ethereum",
};

export function PriceChartModal({ symbol, isOpen, onClose }: ChartModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    // Create TradingView widget
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: SYMBOL_MAP[symbol] || "BINANCE:SOLUSDT",
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(0, 0, 0, 1)",
      gridColor: "rgba(255, 255, 255, 0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [isOpen, symbol]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-zinc-950 border border-zinc-800 w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">{NAMES[symbol] || symbol}</h2>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1">
              {symbol}/USDT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Chart Container */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="tradingview-widget-container absolute inset-0"
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Powered by TradingView</span>
          <div className="flex gap-4">
            <a
              href={`https://www.tradingview.com/symbols/${SYMBOL_MAP[symbol]?.replace(":", "-")}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Open in TradingView →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
