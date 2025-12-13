"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Small delay to ensure container is mounted
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
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
        backgroundColor: "rgba(9, 9, 11, 1)",
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
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, symbol]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        zIndex: 99999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ 
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.98)",
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-6xl mx-4 flex flex-col bg-zinc-950 border border-zinc-800"
        style={{ 
          position: "relative",
          height: "85vh",
          maxHeight: "900px",
          zIndex: 100000,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg text-white">{NAMES[symbol] || symbol}</h2>
            <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1">
              {symbol}/USDT
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors text-2xl px-2 py-1 hover:bg-zinc-800 rounded"
          >
            ✕
          </button>
        </div>

        {/* Chart Container */}
        <div className="flex-1 relative bg-zinc-950">
          <div
            ref={containerRef}
            className="tradingview-widget-container"
            style={{ 
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-500 bg-zinc-950">
          <span>Powered by TradingView</span>
          <div className="flex gap-4">
            <a
              href={`https://www.tradingview.com/chart/?symbol=${SYMBOL_MAP[symbol]}`}
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

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
}
