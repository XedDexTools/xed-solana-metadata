"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PriceWidget } from "@/components/price-widget";
import { useToast } from "@/components/toast";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { TiltCard } from "@/components/tilt-card";
import { ScrollReveal } from "@/components/scroll-reveal";

type Token = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

function TokenCard({ token, onCopy }: { token: Token; onCopy: (text: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TiltCard>
      <div className="border border-white/10 bg-zinc-950 overflow-hidden hover:border-purple-500/50 transition-all card-glow h-full">
        <Link href={`/token/${token.mint}`} className="block p-4">
          <div className="flex items-start gap-4">
            {token.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={token.image} alt={token.name} className="w-16 h-16 object-cover bg-zinc-900 border border-zinc-800 flex-shrink-0 transition-transform hover:scale-105" />
            ) : (
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-zinc-600">{token.symbol.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold truncate hover:text-purple-400 transition-colors">{token.name}</h3>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5">${token.symbol}</span>
              </div>
              <p className="text-xs font-mono text-zinc-500 mt-1 truncate">{token.mint}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {new Date(token.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Link>

        {token.description && (
          <div className="px-4 pb-4">
            <p className={`text-sm text-zinc-400 ${!expanded ? "line-clamp-2" : ""}`}>{token.description}</p>
            {token.description.length > 100 && (
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-zinc-500 hover:text-purple-400 mt-1 transition-colors">
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {(token.twitter || token.telegram || token.website) && (
          <div className="border-t border-zinc-800 px-4 py-3 flex items-center gap-4">
            {token.twitter && (
              <a href={token.twitter.startsWith("@") ? `https://twitter.com/${token.twitter.slice(1)}` : token.twitter.startsWith("http") ? token.twitter : `https://twitter.com/${token.twitter}`}
                target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
            )}
            {token.telegram && (
              <a href={token.telegram.startsWith("http") ? token.telegram : `https://t.me/${token.telegram.replace("t.me/", "")}`}
                target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            )}
            {token.website && (
              <a href={token.website.startsWith("http") ? token.website : `https://${token.website}`}
                target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </a>
            )}
            <button 
              onClick={(e) => { e.preventDefault(); onCopy(token.mint); }} 
              className="ml-auto text-xs text-zinc-500 hover:text-purple-400 transition-colors font-mono flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Mint
            </button>
          </div>
        )}
      </div>
    </TiltCard>
  );
}

export default function ExplorerPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Mint address copied!", "success");
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  const fetchTokens = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20", sort: sortBy });
      if (search) params.set("search", search);
      if (dateFilter !== "all") params.set("date", dateFilter);
      const response = await fetch(`/api/explorer?${params}`);
      const data = await response.json();
      if (!data.error) {
        setTokens(data.tokens);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, dateFilter]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      <KeyboardShortcuts onSearchFocus={focusSearch} />
      
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
      <div className="scanline" />

      <nav className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors glow-white" />
              <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
            </Link>
            <div className="hidden lg:block border-l border-white/10 pl-4">
              <PriceWidget />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/start" className="text-sm text-zinc-400 hover:text-white transition-colors">Submit Token</Link>
            <Link href="/status" className="text-sm text-zinc-400 hover:text-white transition-colors">Check Status</Link>
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex-1 p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <ScrollReveal direction="down">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-text-animated">TOKEN EXPLORER</h1>
                <p className="text-zinc-400 mt-1">Browse all approved tokens in the registry</p>
              </div>
              {pagination && (
                <div className="bg-zinc-900/80 backdrop-blur-sm px-4 py-2 text-sm font-mono border border-white/10 glow-purple">
                  <span className="text-green-400">{pagination.total}</span>
                  <span className="text-zinc-500"> TOKENS REGISTERED</span>
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <div className="border border-white/10 bg-zinc-950/80 backdrop-blur-sm p-4 space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    ref={searchInputRef}
                    value={searchInput} 
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name, symbol, or mint address..."
                    className="flex-1 bg-zinc-900 border-zinc-800 h-10 rounded-none pr-16" 
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="kbd">K</span>
                  </div>
                </div>
                <Button type="submit" className="h-10 px-6 bg-white text-black hover:bg-zinc-200 rounded-none font-mono text-xs btn-glow">SEARCH</Button>
                {search && <Button type="button" onClick={() => { setSearchInput(""); setSearch(""); }} variant="outline" className="h-10 px-4 rounded-none font-mono text-xs border-zinc-700">CLEAR</Button>}
              </form>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">SORT:</span>
                    {[{ value: "newest", label: "NEWEST" }, { value: "oldest", label: "OLDEST" }, { value: "name", label: "A-Z" }].map((option) => (
                      <button key={option.value} onClick={() => setSortBy(option.value)}
                        className={`px-3 py-1.5 text-xs font-mono transition-all ${sortBy === option.value ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-mono">DATE:</span>
                    {[
                      { value: "all", label: "ALL" },
                      { value: "today", label: "TODAY" },
                      { value: "week", label: "WEEK" },
                      { value: "month", label: "MONTH" },
                    ].map((option) => (
                      <button 
                        key={option.value} 
                        onClick={() => setDateFilter(option.value as typeof dateFilter)}
                        className={`px-3 py-1.5 text-xs font-mono transition-all ${dateFilter === option.value ? "bg-purple-500 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono">VIEW:</span>
                  <button onClick={() => setViewMode("grid")} className={`p-2 transition-all ${viewMode === "grid" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  </button>
                  <button onClick={() => setViewMode("list")} className={`p-2 transition-all ${viewMode === "list" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-white/10 bg-zinc-950 p-4 animate-pulse h-40">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-zinc-800 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <ScrollReveal>
              <div className="border border-white/10 bg-zinc-950 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-zinc-900 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-400 font-mono">{search ? "No tokens found matching your search" : "No approved tokens yet"}</p>
                <Link href="/start" className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors">Be the first to submit →</Link>
              </div>
            </ScrollReveal>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {tokens.map((token, i) => (
                <ScrollReveal key={token.id} delay={i * 50} direction="up">
                  <TokenCard token={token} onCopy={handleCopy} />
                </ScrollReveal>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <ScrollReveal>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button 
                  onClick={() => fetchTokens(pagination.page - 1)} 
                  disabled={!pagination.hasPrev || loading} 
                  variant="outline" 
                  className="rounded-none font-mono text-xs border-zinc-700 disabled:opacity-50 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                >
                  ← PREV
                </Button>
                <span className="text-sm font-mono text-zinc-400">
                  Page <span className="text-white">{pagination.page}</span> of <span className="text-white">{pagination.totalPages}</span>
                </span>
                <Button 
                  onClick={() => fetchTokens(pagination.page + 1)} 
                  disabled={!pagination.hasNext || loading} 
                  variant="outline" 
                  className="rounded-none font-mono text-xs border-zinc-700 disabled:opacity-50 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
                >
                  NEXT →
                </Button>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </main>
  );
}
