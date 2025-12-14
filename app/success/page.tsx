"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PriceWidget } from "@/components/price-widget";
import { Confetti } from "@/components/confetti";
import { AuroraBackground } from "@/components/aurora-background";
import { ScrollReveal } from "@/components/scroll-reveal";
import { GradientText } from "@/components/gradient-text";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const mint = searchParams.get("mint") || "";
  const name = searchParams.get("name") || "Your Token";
  const symbol = searchParams.get("symbol") || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("xed-form-draft");
    }
    // Trigger confetti after a small delay
    setTimeout(() => setShowConfetti(true), 300);
  }, []);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Just submitted ${name} ($${symbol}) to @XEDscreener - the FREE Solana token metadata registry! No $300 fees. 🚀\n\nCheck it out: https://xedscreener.xyz`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Confetti Celebration! */}
      <Confetti trigger={showConfetti} duration={4000} particleCount={150} />
      
      {/* Aurora Background */}
      <AuroraBackground />
      
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-20" />
      <div className="scanline" />

      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
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

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-lg w-full space-y-8">
          <ScrollReveal direction="down">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-6 glow-green success-bounce">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                <GradientText>SUBMISSION RECEIVED</GradientText>
              </h1>
              <p className="text-zinc-400">Your token metadata has been submitted for review</p>
            </div>
          </ScrollReveal>

          {(name || symbol) && (
            <ScrollReveal direction="up" delay={200}>
              <div className="border border-white/10 bg-zinc-950/80 backdrop-blur-sm p-6 card-glow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center glow-purple">
                    <span className="text-2xl font-bold text-purple-400">{symbol.charAt(0) || "?"}</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{name}</h2>
                    {symbol && <span className="text-sm font-mono text-purple-400">${symbol}</span>}
                  </div>
                </div>
                {mint && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 font-mono mb-1">MINT ADDRESS</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono truncate flex-1">{mint}</p>
                      <button onClick={() => handleCopy(mint, "mint")} className="text-xs text-zinc-500 hover:text-purple-400 transition-colors">
                        {copied === "mint" ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal direction="up" delay={300}>
            <div className="border border-white/10 bg-zinc-950/80 backdrop-blur-sm p-6 space-y-4">
              <h3 className="font-mono text-xs text-zinc-500">WHAT HAPPENS NEXT</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-500 flex items-center justify-center glow-green">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="w-0.5 h-full bg-zinc-800 mt-2" />
                  </div>
                  <div className="pb-4">
                    <p className="font-bold text-sm">Submission Received</p>
                    <p className="text-xs text-zinc-500">Your request is in our queue</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="w-0.5 h-full bg-zinc-800 mt-2" />
                  </div>
                  <div className="pb-4">
                    <p className="font-bold text-sm">Under Review</p>
                    <p className="text-xs text-zinc-500">Typically takes 10-15 minutes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-500">Approved & Live</p>
                    <p className="text-xs text-zinc-500">Token will appear in the registry</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={400}>
            <div className="space-y-3">
              <Link href={mint ? `/status?mint=${encodeURIComponent(mint)}` : "/status"} className="block">
                <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-sm btn-glow">CHECK STATUS</Button>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={shareOnTwitter} variant="outline" className="h-12 rounded-none font-mono text-xs border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  SHARE
                </Button>
                <Link href="/start" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-none font-mono text-xs border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all">+ SUBMIT ANOTHER</Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="fade" delay={500}>
            <div className="border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <Link href="/explorer" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">View Explorer →</Link>
                <Link href="/docs" className="text-sm text-zinc-400 hover:text-purple-400 transition-colors">Read Docs →</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black text-white flex items-center justify-center"><div className="animate-pulse">Loading...</div></main>}>
      <SuccessContent />
    </Suspense>
  );
}
