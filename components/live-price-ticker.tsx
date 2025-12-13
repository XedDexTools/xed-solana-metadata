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

  // Fetch prices via CoinGecko (better CORS support)
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
        { cache: "no-store" }
      );
      
      if (!response.ok) throw new Error("API error");
      
      const data = await response.json();
      
      const newPrices: Record<string, PriceData> = {};
      
      if (data.solana) {
        const price = data.solana.usd;
        const prevPrice = prevPrices.current["SOL"] || price;
        if (price !== prevPrice) {
          setFlashStates(prev => ({ ...prev, SOL: price > prevPrice ? "up" : "down" }));
          setTimeout(() => setFlashStates(prev => ({ ...prev, SOL: null })), 300);
        }
        prevPrices.current["SOL"] = price;
        newPrices["SOL"] = { symbol: "SOL", price, change24h: data.solana.usd_24h_change || 0 };
      }
      
      if (data.bitcoin) {
        const price = data.bitcoin.usd;
        const prevPrice = prevPrices.current["BTC"] || price;
        if (price !== prevPrice) {
          setFlashStates(prev => ({ ...prev, BTC: price > prevPrice ? "up" : "down" }));
          setTimeout(() => setFlashStates(prev => ({ ...prev, BTC: null })), 300);
        }
        prevPrices.current["BTC"] = price;
        newPrices["BTC"] = { symbol: "BTC", price, change24h: data.bitcoin.usd_24h_change || 0 };
      }
      
      if (data.ethereum) {
        const price = data.ethereum.usd;
        const prevPrice = prevPrices.current["ETH"] || price;
        if (price !== prevPrice) {
          setFlashStates(prev => ({ ...prev, ETH: price > prevPrice ? "up" : "down" }));
          setTimeout(() => setFlashStates(prev => ({ ...prev, ETH: null })), 300);
        }
        prevPrices.current["ETH"] = price;
        newPrices["ETH"] = { symbol: "ETH", price, change24h: data.ethereum.usd_24h_change || 0 };
      }
      
      setPrices(newPrices);
    } catch (error) {
      console.error("Failed to fetch prices:", error);
      // Try Binance as fallback
      tryBinanceFallback();
    }
  }, []);

  const tryBinanceFallback = async () => {
    try {
      const results = await Promise.all(
        TOKENS.map(async (token) => {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${token.binanceSymbol}`);
          return res.json();
        })
      );
      
      const newPrices: Record<string, PriceData> = {};
      results.forEach((data, i) => {
        if (data.lastPrice) {
          const symbol = TOKENS[i].symbol;
          newPrices[symbol] = {
            symbol,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent) || 0,
          };
          prevPrices.current[symbol] = parseFloat(data.lastPrice);
        }
      });
      
      if (Object.keys(newPrices).length > 0) {
        setPrices(newPrices);
      }
    } catch (err) {
      console.error("Binance fallback failed:", err);
    }
  };

  // Connect WebSocket for real-time updates
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
        } catch (err) {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    } catch (error) {
      setTimeout(connectWebSocket, 5000);
    }
  }, []);

  useEffect(() => {
    // Fetch prices immediately
    fetchPrices();
    
    // Poll every 10 seconds as backup
    const pollInterval = setInterval(fetchPrices, 10000);
    
    // Connect WebSocket for real-time
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
              <span className="text-xs text-zinc-500">...</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

