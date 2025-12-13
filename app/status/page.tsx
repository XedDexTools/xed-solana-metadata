"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

type Submission = {
  id: string;
  mint: string;
  wallet: string;
  name: string;
  symbol: string;
  image: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

type SearchResult = {
  found: boolean;
  submissions?: Submission[];
  message?: string;
  error?: string;
};

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", dot: "bg-yellow-500", label: "PENDING" },
    approved: { bg: "bg-green-500/20", text: "text-green-400", dot: "bg-green-500", label: "APPROVED" },
    rejected: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-500", label: "REJECTED" },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot} ${status === "pending" ? "animate-pulse" : ""}`} />
      {config.label}
    </span>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const date = new Date(submission.submittedAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="border border-white/10 bg-zinc-950 p-6 space-y-4">
      <div className="flex items-start gap-4">
        {submission.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={submission.image} alt={submission.name} className="w-16 h-16 object-cover bg-zinc-900 border border-zinc-800" />
        ) : (
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <span className="text-2xl font-bold text-zinc-600">?</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-lg truncate">{submission.name}</h3>
            <span className="text-sm font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5">${submission.symbol}</span>
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-1 truncate">{submission.mint}</p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">SUBMITTED</p>
          <p className="text-sm">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 font-mono mb-1">WALLET</p>
          <p className="text-sm font-mono truncate">{submission.wallet.slice(0, 8)}...{submission.wallet.slice(-8)}</p>
        </div>
      </div>

      {submission.status === "pending" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs">
          <p className="text-yellow-400">⏳ Your submission is being reviewed. This typically takes 10-15 minutes.</p>
        </div>
      )}
      {submission.status === "approved" && (
        <div className="bg-green-500/10 border border-green-500/20 p-3 text-xs">
          <p className="text-green-400">✓ Your token metadata has been approved and is now live in the registry.</p>
        </div>
      )}
      {submission.status === "rejected" && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 text-xs">
          <p className="text-red-400">✕ Your submission was not approved. Please review our guidelines and try again.</p>
        </div>
      )}
    </div>
  );
}

function StatusSearchForm() {
  const searchParams = useSearchParams();
  const [searchType, setSearchType] = useState<"mint" | "wallet">("mint");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    const mint = searchParams.get("mint");
    const wallet = searchParams.get("wallet");
    if (mint) { setSearchType("mint"); setSearchValue(mint); performSearch("mint", mint); }
    else if (wallet) { setSearchType("wallet"); setSearchValue(wallet); performSearch("wallet", wallet); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function performSearch(type: "mint" | "wallet", value: string) {
    if (!value.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/status?${type}=${encodeURIComponent(value.trim())}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Search error:", error);
      setResult({ found: false, error: "Failed to search. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performSearch(searchType, searchValue);
  }

  return (
    <>
      <form onSubmit={handleSearch} className="space-y-4 border border-white/10 p-6 bg-zinc-950">
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setSearchType("mint")}
            className={`px-4 py-2 text-xs font-mono transition-colors ${searchType === "mint" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
            BY MINT
          </button>
          <button type="button" onClick={() => setSearchType("wallet")}
            className={`px-4 py-2 text-xs font-mono transition-colors ${searchType === "wallet" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"}`}>
            BY WALLET
          </button>
        </div>
        <div className="space-y-2">
          <Label className="uppercase text-xs font-bold tracking-wide text-zinc-300">
            {searchType === "mint" ? "Mint Address" : "Wallet Address"}
          </Label>
          <Input value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchType === "mint" ? "Enter token mint address..." : "Enter wallet address..."}
            className="bg-zinc-900 border-zinc-800 focus:border-white h-12 font-mono text-sm rounded-none" />
        </div>
        <Button type="submit" disabled={loading || !searchValue.trim()}
          className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-sm disabled:opacity-50">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              SEARCHING...
            </span>
          ) : "SEARCH"}
        </Button>
      </form>

      {result && (
        <div className="space-y-4 mt-6">
          {result.error && (
            <div className="border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400 font-mono">{result.error}</p>
            </div>
          )}
          {result.found === false && !result.error && (
            <div className="border border-white/10 bg-zinc-950 p-8 text-center">
              <p className="text-zinc-400 font-mono text-sm">{result.message || "No submissions found"}</p>
              <Link href="/start" className="inline-block mt-4 text-sm text-white underline hover:no-underline">Submit a new token →</Link>
            </div>
          )}
          {result.found && result.submissions && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 font-mono">Found {result.submissions.length} submission{result.submissions.length !== 1 ? "s" : ""}</p>
              {result.submissions.map((sub) => <SubmissionCard key={sub.id} submission={sub} />)}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
      <div className="scanline" />

      <nav className="border-b border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/start" className="text-sm text-zinc-400 hover:text-white transition-colors">Submit Token</Link>
            <Link href="/explorer" className="text-sm text-zinc-400 hover:text-white transition-colors">Explorer</Link>
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">SUBMISSION STATUS</h1>
            <p className="text-zinc-400">Track the status of your token metadata submission</p>
          </div>

          <Suspense fallback={<div className="animate-pulse bg-zinc-900 h-48" />}>
            <StatusSearchForm />
          </Suspense>

          <div className="border-t border-white/10 pt-8 mt-8">
            <h2 className="font-mono text-xs text-zinc-500 mb-4">NEED HELP?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/start" className="border border-white/10 p-4 hover:bg-zinc-950 transition-colors group">
                <p className="font-bold text-sm group-hover:underline">Submit New Token</p>
                <p className="text-xs text-zinc-500 mt-1">Register your token metadata</p>
              </Link>
              <Link href="/docs" className="border border-white/10 p-4 hover:bg-zinc-950 transition-colors group">
                <p className="font-bold text-sm group-hover:underline">Documentation</p>
                <p className="text-xs text-zinc-500 mt-1">Learn about the submission process</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
