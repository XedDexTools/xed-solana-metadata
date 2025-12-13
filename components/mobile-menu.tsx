"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2" aria-label="Toggle menu">
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white" />
              <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2" aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col p-6 space-y-6">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-bold hover:text-zinc-300 transition-colors">HOME</Link>
            <Link href="/explorer" onClick={() => setIsOpen(false)} className="text-2xl font-bold hover:text-zinc-300 transition-colors">EXPLORER</Link>
            <Link href="/status" onClick={() => setIsOpen(false)} className="text-2xl font-bold hover:text-zinc-300 transition-colors">STATUS</Link>
            <Link href="/docs" onClick={() => setIsOpen(false)} className="text-2xl font-bold hover:text-zinc-300 transition-colors">DOCS</Link>
            <Link href="/start" onClick={() => setIsOpen(false)} className="text-2xl font-bold hover:text-zinc-300 transition-colors">LAUNCH APP</Link>

            <div className="pt-6 flex items-center gap-6">
              <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>

            <div className="pt-6">
              <Link href="/start" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-14 bg-green-500 text-white hover:bg-green-600 rounded-none font-bold tracking-widest text-sm">
                  SUBMIT TOKEN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
