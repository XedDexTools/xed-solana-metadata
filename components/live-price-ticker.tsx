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
  { symbol: "SOL", binanceSymbol: "SOLUSDT", coingeckoId: "solana", icon: "◎" },
  { symbol: "BTC", binanceSymbol: "BTCUSDT", coingeckoId: "bitcoin", icon: "₿" },
  { symbol: "ETH", binanceSymbol: "ETHUSDT", coingeckoId: "ethereum", icon: "Ξ" },
];

export function LivePriceTicker({ onTokenClick }: TickerProps) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const [flashStates, setFlashStates] = useState<Record<string, "up" | "down" | null>>({});
  const [error, setError] = useState(false);
  const prevPrices = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);

  // Fetch prices via CoinGecko
  const fetchPrices = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
        { 
          signal: controller.signal,
          headers: { "Accept": "application/json" }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("API error");
      }
      
      const data = await response.json();
      const newPrices: Record<string, PriceData> = {};
      
      TOKENS.forEach((token) => {
        const coinData = data[token.coingeckoId];
        if (coinData) {
          const price = coinData.usd;
          const prevPrice = prevPrices.current[token.symbol] || price;
          
          if (price !== prevPrice) {
            setFlashStates(prev => ({ 
              ...prev, 
              [token.symbol]: price > prevPrice ? "up" : "down" 
            }));
            setTimeout(() => setFlashStates(prev => ({ ...prev, [token.symbol]: null })), 300);
          }
          
          prevPrices.current[token.symbol] = price;
          newPrices[token.symbol] = { 
            symbol: token.symbol, 
            price, 
            change24h: coinData.usd_24h_change || 0 
          };
        }
      });
      
      if (Object.keys(newPrices).length > 0) {
        setPrices(newPrices);
        setError(false);
        retryCount.current = 0;
      }
    } catch (err) {
      // Silently handle errors - don't spam console
      if (retryCount.current < 3) {
        retryCount.current++;
      } else {
        setError(true);
      }
    }
  }, []);

  // Connect WebSocket for real-time updates (optional enhancement)
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const streams = TOKENS.map((t) => `${t.binanceSymbol.toLowerCase()}@ticker`).join("/");
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const symbol = data.s?.replace("USDT", "") || "";
          const price = parseFloat(data.c);
          const change24h = parseFloat(data.P);

          if (!symbol || isNaN(price)) return;

          const prevPrice = prevPrices.current[symbol] || price;
          
          if (price !== prevPrice) {
            setFlashStates((prev) => ({ 
              ...prev, 
              [symbol]: price > prevPrice ? "up" : "down" 
            }));
            setTimeout(() => {
              setFlashStates((prev) => ({ ...prev, [symbol]: null }));
            }, 300);
          }

          prevPrices.current[symbol] = price;
          setPrices((prev) => ({
            ...prev,
            [symbol]: { symbol, price, change24h },
          }));
          setError(false);
        } catch {
          // Ignore parse errors silently
        }
      };

      ws.onerror = () => {
        // Silently handle WebSocket errors
      };

      ws.onclose = () => {
        wsRef.current = null;
        // Don't auto-reconnect to avoid spam
      };

      wsRef.current = ws;
    } catch {
      // Silently handle connection errors
    }
  }, []);

  useEffect(() => {
    // Fetch prices immediately
    fetchPrices();
    
    // Poll every 30 seconds (CoinGecko rate limit friendly)
    const pollInterval = setInterval(fetchPrices, 30000);
    
    // Try WebSocket after 2 seconds
    const wsTimer = setTimeout(connectWebSocket, 2000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(wsTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchPrices, connectWebSocket]);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "BTC") {
      if (price >= 1000) {
        return `$${(price / 1000).toFixed(1)}K`;
      }
      return `$${price.toFixed(0)}`;
    }
    if (symbol === "ETH") {
      return `$${price.toFixed(0)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  // If we have errors and no prices, show minimal UI
  if (error && Object.keys(prices).length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="opacity-50">Prices unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {TOKENS.map((token) => {
        const data = prices[token.symbol];
        const flash = flashStates[token.symbol];
        const isUp = (data?.change24h ?? 0) >= 0;

        return (
          <button
            key={token.symbol}
            onClick={() => onTokenClick?.(token.symbol)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded transition-all duration-150
              hover:bg-zinc-800 cursor-pointer
              ${flash === "up" ? "bg-green-500/30" : ""}
              ${flash === "down" ? "bg-red-500/30" : ""}
            `}
          >
            <span className="text-xs opacity-60">{token.icon}</span>
            {data ? (
              <>
                <span
                  className={`text-xs font-semibold tabular-nums transition-colors ${
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
                  className={`text-[10px] font-medium hidden xl:inline ${
                    isUp ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {isUp ? "↑" : "↓"}{Math.abs(data.change24h).toFixed(1)}%
                </span>
              </>
            ) : (
              <span className="text-xs text-zinc-600">—</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
