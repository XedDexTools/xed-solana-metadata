"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type PriceData = {
  symbol: string;
  price: number;
  change24h: number;
  direction: "up" | "down" | "neutral";
};

type TickerProps = {
  onTokenClick?: (symbol: string) => void;
};

const TOKENS = [
  { symbol: "SOL", wsSymbol: "solusdt", icon: "◎" },
  { symbol: "BTC", wsSymbol: "btcusdt", icon: "₿" },
  { symbol: "ETH", wsSymbol: "ethusdt", icon: "Ξ" },
];

export function LivePriceTicker({ onTokenClick }: TickerProps) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [flashStates, setFlashStates] = useState<Record<string, "up" | "down" | null>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    // Binance WebSocket for real-time prices
    const streams = TOKENS.map((t) => `${t.wsSymbol}@ticker`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.onopen = () => {
      console.log("Price WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const symbol = data.s?.replace("USDT", "") || "";
        const price = parseFloat(data.c);
        const change24h = parseFloat(data.P);

        if (!symbol || isNaN(price)) return;

        const prevPrice = prevPrices.current[symbol] || price;
        const direction: "up" | "down" | "neutral" =
          price > prevPrice ? "up" : price < prevPrice ? "down" : "neutral";

        // Trigger flash animation
        if (direction !== "neutral") {
          setFlashStates((prev) => ({ ...prev, [symbol]: direction }));
          setTimeout(() => {
            setFlashStates((prev) => ({ ...prev, [symbol]: null }));
          }, 300);
        }

        prevPrices.current[symbol] = price;

        setPrices((prev) => ({
          ...prev,
          [symbol]: { symbol, price, change24h, direction },
        }));
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed, reconnecting in 3s...");
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "SOL") {
      return price.toFixed(2);
    }
    if (price >= 1000) {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(2);
  };

  return (
    <div className="flex items-center gap-1 md:gap-3">
      {TOKENS.map((token) => {
        const data = prices[token.symbol];
        const flash = flashStates[token.symbol];
        const isUp = data?.change24h >= 0;

        return (
          <button
            key={token.symbol}
            onClick={() => onTokenClick?.(token.symbol)}
            className={`
              flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-150
              hover:bg-zinc-800 cursor-pointer
              ${flash === "up" ? "bg-green-500/20" : ""}
              ${flash === "down" ? "bg-red-500/20" : ""}
            `}
          >
            <span className="text-zinc-500 text-sm hidden md:inline">{token.icon}</span>
            <span className="text-xs font-mono text-zinc-400">{token.symbol}</span>
            {data ? (
              <>
                <span
                  className={`text-xs font-mono font-medium transition-colors ${
                    flash === "up"
                      ? "text-green-400"
                      : flash === "down"
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  ${formatPrice(data.price, token.symbol)}
                </span>
                <span
                  className={`text-xs font-mono hidden sm:inline ${
                    isUp ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isUp ? "▲" : "▼"} {Math.abs(data.change24h).toFixed(1)}%
                </span>
              </>
            ) : (
              <span className="text-xs font-mono text-zinc-600">—</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
