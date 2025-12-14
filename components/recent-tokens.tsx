"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TiltCard } from "./tilt-card";
import { ScrollReveal } from "./scroll-reveal";

type Token = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  image: string | null;
  timestamp: string;
};

export function RecentTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/activity");
        if (response.ok) {
          const data = await response.json();
          setTokens((data.activities || []).slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-zinc-800 p-4 animate-pulse">
            <div className="w-12 h-12 bg-zinc-800 mx-auto mb-3" />
            <div className="h-4 bg-zinc-800 rounded mb-2" />
            <div className="h-3 bg-zinc-800 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {tokens.map((token, index) => (
        <ScrollReveal key={token.id} delay={index * 100} direction="up">
          <TiltCard className="h-full">
            <Link
              href={`/token/${token.mint}`}
              className="block border border-zinc-800 p-4 hover:border-purple-500/50 transition-all group text-center relative h-full card-glow bg-zinc-950/50"
            >
              {index === 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 glow-green">
                  NEW
                </span>
              )}
              {token.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={token.image}
                  alt={token.name}
                  className="w-12 h-12 object-cover bg-zinc-800 mx-auto mb-3 transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-lg font-bold text-zinc-600 transition-transform group-hover:scale-110">
                  {token.symbol.charAt(0)}
                </div>
              )}
              <h3 className="font-medium text-sm truncate group-hover:text-white transition-colors">
                {token.name}
              </h3>
              <p className="text-xs font-mono text-zinc-500 group-hover:text-purple-400 transition-colors">${token.symbol}</p>
            </Link>
          </TiltCard>
        </ScrollReveal>
      ))}
    </div>
  );
}
