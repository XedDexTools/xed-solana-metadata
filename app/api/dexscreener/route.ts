import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

// In-memory cache for DexScreener data
const cache = new Map<string, { data: DexScreenerData; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

type DexScreenerPair = {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
};

type DexScreenerResponse = {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
};

export type DexScreenerData = {
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

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`dexscreener:${clientIP}`, RATE_LIMITS.STANDARD);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", data: null },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mint = searchParams.get("mint");

    if (!mint) {
      return NextResponse.json(
        { error: "Missing mint parameter", data: null },
        { status: 400 }
      );
    }

    // Check cache
    const cached = cache.get(mint);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ data: cached.data, cached: true });
    }

    // Fetch from DexScreener
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
      {
        headers: {
          "Accept": "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      // Return empty data on error (token might not be on any DEX)
      const emptyData: DexScreenerData = {
        price: null,
        priceChange24h: null,
        priceChange1h: null,
        volume24h: null,
        liquidity: null,
        marketCap: null,
        fdv: null,
        txns24h: null,
        dexUrl: null,
        pairAddress: null,
        dexId: null,
      };
      return NextResponse.json({ data: emptyData, cached: false });
    }

    const json: DexScreenerResponse = await response.json();

    // If no pairs found, return empty data
    if (!json.pairs || json.pairs.length === 0) {
      const emptyData: DexScreenerData = {
        price: null,
        priceChange24h: null,
        priceChange1h: null,
        volume24h: null,
        liquidity: null,
        marketCap: null,
        fdv: null,
        txns24h: null,
        dexUrl: null,
        pairAddress: null,
        dexId: null,
      };
      cache.set(mint, { data: emptyData, timestamp: Date.now() });
      return NextResponse.json({ data: emptyData, cached: false });
    }

    // Get the pair with highest liquidity (most reliable data)
    const sortedPairs = json.pairs.sort((a, b) => {
      const liquidityA = a.liquidity?.usd || 0;
      const liquidityB = b.liquidity?.usd || 0;
      return liquidityB - liquidityA;
    });

    const bestPair = sortedPairs[0];

    // Aggregate volume and liquidity across all pairs
    const totalVolume24h = json.pairs.reduce((sum, pair) => sum + (pair.volume?.h24 || 0), 0);
    const totalLiquidity = json.pairs.reduce((sum, pair) => sum + (pair.liquidity?.usd || 0), 0);

    const data: DexScreenerData = {
      price: bestPair.priceUsd ? parseFloat(bestPair.priceUsd) : null,
      priceChange24h: bestPair.priceChange?.h24 ?? null,
      priceChange1h: bestPair.priceChange?.h1 ?? null,
      volume24h: totalVolume24h || null,
      liquidity: totalLiquidity || null,
      marketCap: bestPair.marketCap ?? null,
      fdv: bestPair.fdv ?? null,
      txns24h: bestPair.txns?.h24 ?? null,
      dexUrl: `https://dexscreener.com/solana/${bestPair.pairAddress}`,
      pairAddress: bestPair.pairAddress,
      dexId: bestPair.dexId,
    };

    // Cache the result
    cache.set(mint, { data, timestamp: Date.now() });

    return NextResponse.json({ data, cached: false });
  } catch (error) {
    console.error("DexScreener API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data", data: null },
      { status: 500 }
    );
  }
}

