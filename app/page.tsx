"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCounter } from "@/components/stats-counter";
import { MobileMenu } from "@/components/mobile-menu";
import { FAQSection } from "@/components/faq-section";
import { PriceWidget } from "@/components/price-widget";
import { RecentTokens } from "@/components/recent-tokens";
import { ActivityFeed } from "@/components/activity-feed";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { ScrollReveal } from "@/components/scroll-reveal";
import { GradientText } from "@/components/gradient-text";
import { TiltCard } from "@/components/tilt-card";
import { Particles } from "@/components/particles";
import { GradientOrbs } from "@/components/gradient-orbs";
import { TextScramble } from "@/components/text-scramble";
import { NoiseOverlay } from "@/components/noise-overlay";
import { MagneticButton } from "@/components/magnetic-button";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Premium Background Effects */}
      <GradientOrbs count={5} />
      <Particles count={60} color="168, 85, 247" connectDistance={100} />
      <NoiseOverlay opacity={0.02} />
      
      {/* Background Grid & Scanline */}
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-20 cyber-grid-animated" />
      <div className="scanline" />
      
      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 bg-white glow-white breathing-glow" />
              <span className="font-bold tracking-tight text-lg glitch-hover">XED SCREENER</span>
            </Link>
            {/* Live Price Ticker */}
            <div className="hidden lg:block border-l border-white/10 pl-4">
              <PriceWidget />
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explorer" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
              EXPLORER
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/status" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
              STATUS
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/docs" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group">
              DOCS
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300" />
            </Link>
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white hover:glow-pulse transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white hover:glow-pulse transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <Link href="/start">
              <MagneticButton className="h-9 px-6 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-wide text-xs btn-glow">
                LAUNCH APP
              </MagneticButton>
            </Link>
          </div>
          {/* Mobile Navigation */}
          <MobileMenu />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <ScrollReveal direction="down" delay={0}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-zinc-400 electric-border">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-glow" />
                <TextScramble text="SYSTEM ONLINE" speed={40} />
              </div>
              <StatsCounter />
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">
              <span className="gradient-text-animated">METADATA</span> <br />
              <TextScramble 
                text="INFRASTRUCTURE" 
                className="text-glow text-6xl md:text-8xl font-bold tracking-tighter"
                speed={30}
              />
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={200}>
            <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-mono">
              The decentralized registry for Solana assets. <br className="hidden md:block" />
              <span className="text-zinc-400">Permissionless.</span> <span className="text-purple-400">Immutable.</span> <span className="text-blue-400">Standardized.</span>
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/start" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto h-14 px-10 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-sm btn-glow hover-lift">
                  INITIALIZE
                </MagneticButton>
              </Link>
              <Link href="/docs" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-10 border-white/20 bg-transparent hover:bg-white/5 text-white rounded-none font-mono text-xs neon-border electric-border">
                  READ_DOCS
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { title: "01 // MODULAR", desc: "Composable metadata standards for next-gen assets." },
            { title: "02 // PERMISSIONLESS", desc: "No gatekeepers. Direct on-chain registration." },
            { title: "03 // VERIFIED", desc: "Cryptographic proof of asset authenticity." }
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 150} direction="up">
              <TiltCard>
                <div className="p-12 hover:bg-white/5 transition-all group cursor-default feature-card hover-lift">
                  <h3 className="text-sm font-mono text-zinc-500 mb-4 group-hover:text-purple-400 transition-colors">
                    <TextScramble text={item.title} onHover={true} speed={30} />
                  </h3>
                  <p className="text-xl font-medium tracking-tight max-w-[240px] group-hover:text-glow transition-all">{item.desc}</p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-sm py-8">
        <div className="max-w-2xl mx-auto px-6">
          <ScrollReveal direction="fade">
            <SearchAutocomplete placeholder="Search tokens by name, symbol, or mint address..." />
          </ScrollReveal>
        </div>
      </div>

      {/* Recent Tokens */}
      <div className="relative z-10 border-t border-white/10 bg-zinc-950/80 backdrop-blur-sm py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <ScrollReveal direction="left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-mono text-zinc-500">
                <TextScramble text="RECENTLY VERIFIED" onHover={true} speed={40} />
              </h2>
              <Link href="/explorer" className="text-xs font-mono text-zinc-500 hover:text-purple-400 transition-colors relative group">
                VIEW ALL →
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-purple-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
          </ScrollReveal>
          <RecentTokens />
        </div>
      </div>

      {/* Activity Feed & Quick Links */}
      <div className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-sm py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <ScrollReveal direction="left" className="lg:col-span-1 order-2 lg:order-1">
              <h2 className="text-sm font-mono text-zinc-500 mb-4">
                <TextScramble text="LIVE ACTIVITY" onHover={true} speed={40} />
              </h2>
              <div className="border border-white/10 bg-zinc-950/80 max-h-[400px] overflow-y-auto card-glow electric-border">
                <ActivityFeed />
              </div>
            </ScrollReveal>

            {/* Quick Links */}
            <ScrollReveal direction="right" className="lg:col-span-2 order-1 lg:order-2">
              <h2 className="text-sm font-mono text-zinc-500 mb-4">QUICK ACCESS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { href: "/explorer", icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>, title: "Explorer", desc: "Browse all tokens" },
                  { href: "/status", icon: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>, title: "Status", desc: "Track submissions" },
                  { href: "/start", icon: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>, title: "Submit", desc: "Register for free" },
                ].map((item, i) => (
                  <TiltCard key={i}>
                    <Link href={item.href} className="group border border-white/10 p-6 hover:border-purple-500/50 transition-all block feature-card hover-lift">
                      <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 group-hover:glow-purple transition-all">
                        <svg className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 group-hover:glow-pulse transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {item.icon}
                        </svg>
                      </div>
                      <h3 className="font-bold mb-1 group-hover:text-purple-400 transition-colors">{item.title}</h3>
                      <p className="text-xs text-zinc-500">{item.desc}</p>
                    </Link>
                  </TiltCard>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/90 backdrop-blur-sm py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-xs font-mono text-zinc-600">
          <div className="glitch-hover cursor-default">XED.SCREENER_V1.0</div>
          <div className="flex gap-6">
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 cursor-pointer transition-colors relative group">
              TWITTER
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 cursor-pointer transition-colors relative group">
              GITHUB
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-purple-500 group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
