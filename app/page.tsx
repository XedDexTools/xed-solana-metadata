"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Background Grid & Scanline */}
      <div className="fixed inset-0 arc-grid pointer-events-none z-0" />
      <div className="scanline" />
      
      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white" />
            <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/docs" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">DOCS</Link>
            <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">ADMIN</Link>
            <Link href="/start">
              <Button className="h-9 px-6 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-wide text-xs">
                LAUNCH APP
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500 pulse-glow" />
            SYSTEM ONLINE
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">
            METADATA <br />
            INFRASTRUCTURE
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-mono">
            The decentralized registry for Solana assets. <br className="hidden md:block" />
            Permissionless. Immutable. Standardized.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/start" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-10 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-sm">
                INITIALIZE
              </Button>
            </Link>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-10 border-white/20 bg-transparent hover:bg-white/5 text-white rounded-none font-mono text-xs">
                READ_DOCS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 border-t border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            {
              title: "01 // MODULAR",
              desc: "Composable metadata standards for next-gen assets."
            },
            {
              title: "02 // PERMISSIONLESS",
              desc: "No gatekeepers. Direct on-chain registration."
            },
            {
              title: "03 // VERIFIED",
              desc: "Cryptographic proof of asset authenticity."
            }
          ].map((item, i) => (
            <div key={i} className="p-12 hover:bg-white/5 transition-colors group cursor-default">
              <h3 className="text-sm font-mono text-zinc-500 mb-4 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-xl font-medium tracking-tight max-w-[240px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-xs font-mono text-zinc-600">
          <div>XED.SCREENER_V1.0</div>
          <div className="flex gap-6">
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 cursor-pointer transition-colors">TWITTER</a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 cursor-pointer transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
