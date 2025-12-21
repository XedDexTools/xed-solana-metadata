"use client";

import Link from "next/link";
import { PriceWidget } from "./price-widget";
import { AuthButton } from "./auth-button";

type NavbarProps = {
  showStatus?: boolean;
};

export function Navbar({ showStatus }: NavbarProps) {
  return (
    <nav className="relative z-10 border-b border-white/10 bg-black">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
          </Link>
          <div className="hidden lg:block border-l border-white/10 pl-4">
            <PriceWidget />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {/* SNOWBALL Badge */}
          <a
            href="https://x.com/i/communities/2001678386968564186"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 border border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/20 text-xs font-mono text-purple-400 hover:text-purple-300 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 pulse-glow" />
            SNOWBALL
          </a>
          <Link href="/explorer" className="text-sm text-zinc-400 hover:text-white transition-colors">Explorer</Link>
          <Link href="/start" className="text-sm text-zinc-400 hover:text-white transition-colors">Submit Token</Link>
          {showStatus && (
            <Link href="/status" className="text-sm text-zinc-400 hover:text-white transition-colors">Status</Link>
          )}
          <Link href="/watchlist" className="text-zinc-400 hover:text-yellow-400 transition-colors" title="Watchlist">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </Link>
          <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </a>
          <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <div className="border-l border-zinc-800 pl-4 ml-2">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

