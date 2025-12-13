"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type PriceData = {
  symbol: string;
  price: number;
  change24h: number;
};

type TickerProps = {
  onTokenClick?: (symbol: string) => void;
};

const TOKENS = [
  { symbol: "SOL", binanceSymbol: "SOLUSDT", icon: "◎" },
  { symbol: "BTC", binanceSymbol: "BTCUSDT", icon: "₿" },
  { symbol: "ETH", binanceSymbol: "ETHUSDT", icon: "Ξ" },
];

export function LivePriceTicker({ onTokenClick }: TickerProps) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [flashStates, setFlashStates] = useState<Record<string, "up" | "down" | null>>({});
  const prevPrices = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial prices via REST API
  const fetchInitialPrices = useCallback(async () => {
    try {
      const symbols = TOKENS.map(t => t.binanceSymbol);
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`
      );
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const newPrices: Record<string, PriceData> = {};
        data.forEach((ticker: { symbol: string; lastPrice: string; priceChangePercent: string }) => {
          const symbol = ticker.symbol.replace("USDT", "");
          const price = parseFloat(ticker.lastPrice);
          const change24h = parseFloat(ticker.priceChangePercent);
          newPrices[symbol] = { symbol, price, change24h };
          prevPrices.current[symbol] = price;
        });
        setPrices(newPrices);
      }
    } catch (error) {
      console.error("Failed to fetch initial prices:", error);
    }
  }, []);

  // Connect to WebSocket for real-time updates
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const streams = TOKENS.map((t) => `${t.binanceSymbol.toLowerCase()}@ticker`).join("/");
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
            [symbol]: { symbol, price, change24h },
          }));
        } catch (err) {
          console.error("WebSocket parse error:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket closed, reconnecting in 5s...");
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
    }
  }, []);

  useEffect(() => {
    // Fetch initial prices immediately
    fetchInitialPrices();
    
    // Then connect WebSocket for real-time updates
    const wsTimer = setTimeout(connectWebSocket, 1000);

    return () => {
      clearTimeout(wsTimer);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchInitialPrices, connectWebSocket]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "BTC") {
      // Format as $90.1K for large numbers
      if (price >= 1000) {
        return `$${(price / 1000).toFixed(1)}K`;
      }
      return `$${price.toFixed(0)}`;
    }
    if (symbol === "ETH") {
      return `$${price.toFixed(0)}`;
    }
    // SOL - show 2 decimals
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="flex items-center gap-1">
      {TOKENS.map((token) => {
        const data = prices[token.symbol];
        const flash = flashStates[token.symbol];
        const isUp = (data?.change24h ?? 0) >= 0;

        return (
          <button
            key={token.symbol}
            onClick={() => onTokenClick?.(token.symbol)}
            className={`
              flex items-center gap-1.5 px-2 py-1.5 rounded transition-all duration-150
              hover:bg-zinc-800 cursor-pointer
              ${flash === "up" ? "bg-green-500/30" : ""}
              ${flash === "down" ? "bg-red-500/30" : ""}
            `}
          >
            <span className="text-sm opacity-70">{token.icon}</span>
            {data ? (
              <>
                <span
                  className={`text-sm font-semibold tabular-nums transition-colors ${
                    flash === "up"
                      ? "text-green-400"
                      : flash === "down"
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {formatPrice(data.price, token.symbol)}
                </span>
                <span
                  className={`text-xs font-medium hidden xl:inline ${
                    isUp ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isUp ? "↑" : "↓"}{Math.abs(data.change24h).toFixed(1)}%
                </span>
              </>
            ) : (
              <span className="text-sm text-zinc-600 animate-pulse">...</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
