import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { Navbar } from "@/components/navbar";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type Token = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  created_at: string;
};

async function getToken(mint: string): Promise<Token | null> {
  const { data, error } = await supabase
    .from("token_submissions")
    .select("*")
    .eq("mint", mint)
    .eq("status", "approved")
    .single();

  if (error || !data) return null;
  return data as Token;
}

export async function generateMetadata({ params }: { params: Promise<{ mint: string }> }): Promise<Metadata> {
  const { mint } = await params;
  const token = await getToken(mint);

  if (!token) {
    return {
      title: "Token Not Found - XED Screener",
      description: "This token could not be found in the registry.",
    };
  }

  return {
    title: `${token.name} ($${token.symbol}) - XED Screener`,
    description: token.description?.slice(0, 160) || `View ${token.name} token metadata on XED Screener.`,
    openGraph: {
      title: `${token.name} ($${token.symbol})`,
      description: token.description?.slice(0, 160) || `View ${token.name} token metadata on XED Screener.`,
      images: token.image ? [{ url: token.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${token.name} ($${token.symbol})`,
      description: token.description?.slice(0, 160) || `View ${token.name} token metadata on XED Screener.`,
      images: token.image ? [token.image] : [],
    },
  };
}

export default async function TokenPage({ params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  const token = await getToken(mint);

  if (!token) {
    notFound();
  }

  const createdDate = new Date(token.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
      <div className="scanline" />

      {/* Navbar */}
      <Navbar />

      {/* Breadcrumb */}
      <div className="relative z-10 border-b border-white/10 bg-zinc-950">
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <span>/</span>
            <Link href="/explorer" className="hover:text-white transition-colors">EXPLORER</Link>
            <span>/</span>
            <span className="text-white">{token.symbol}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Token Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="flex items-start gap-6">
                {token.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={token.image}
                    alt={token.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover bg-zinc-900 border border-zinc-800"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <span className="text-4xl font-bold text-zinc-600">{token.symbol.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold">{token.name}</h1>
                    <span className="text-lg font-mono text-zinc-500 bg-zinc-900 px-3 py-1">${token.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      VERIFIED
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">Added {createdDate}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border border-white/10 bg-zinc-950 p-6">
                <h2 className="font-mono text-xs text-zinc-500 mb-4">DESCRIPTION</h2>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{token.description}</p>
              </div>

              {/* Mint Address */}
              <div className="border border-white/10 bg-zinc-950 p-6">
                <h2 className="font-mono text-xs text-zinc-500 mb-4">MINT ADDRESS</h2>
                <div className="flex items-center gap-4">
                  <code className="flex-1 text-sm font-mono text-zinc-300 bg-zinc-900 p-3 overflow-x-auto">
                    {token.mint}
                  </code>
                  <CopyButton text={token.mint} />
                </div>
              </div>
            </div>

            {/* Right Column - Links & Actions */}
            <div className="space-y-6">
              {/* Social Links */}
              <div className="border border-white/10 bg-zinc-950 p-6">
                <h2 className="font-mono text-xs text-zinc-500 mb-4">LINKS</h2>
                <div className="space-y-3">
                  {token.twitter && (
                    <a
                      href={token.twitter.startsWith("@") ? `https://twitter.com/${token.twitter.slice(1)}` : token.twitter.startsWith("http") ? token.twitter : `https://twitter.com/${token.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      <span className="text-sm">Twitter / X</span>
                      <span className="ml-auto text-zinc-500">→</span>
                    </a>
                  )}
                  {token.telegram && (
                    <a
                      href={token.telegram.startsWith("http") ? token.telegram : `https://t.me/${token.telegram.replace("t.me/", "").replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      <span className="text-sm">Telegram</span>
                      <span className="ml-auto text-zinc-500">→</span>
                    </a>
                  )}
                  {token.website && (
                    <a
                      href={token.website.startsWith("http") ? token.website : `https://${token.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-zinc-900 hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-5 h-5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      <span className="text-sm">Website</span>
                      <span className="ml-auto text-zinc-500">→</span>
                    </a>
                  )}
                  {!token.twitter && !token.telegram && !token.website && (
                    <p className="text-sm text-zinc-500 font-mono">No links provided</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border border-white/10 bg-zinc-950 p-6">
                <h2 className="font-mono text-xs text-zinc-500 mb-4">QUICK ACTIONS</h2>
                <div className="space-y-3">
                  <a
                    href={`https://solscan.io/token/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 bg-zinc-900 hover:bg-zinc-800 text-center text-sm font-mono transition-colors"
                  >
                    VIEW ON SOLSCAN →
                  </a>
                  <a
                    href={`https://birdeye.so/token/${token.mint}?chain=solana`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 bg-zinc-900 hover:bg-zinc-800 text-center text-sm font-mono transition-colors"
                  >
                    VIEW ON BIRDEYE →
                  </a>
                  <a
                    href={`https://dexscreener.com/solana/${token.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 bg-zinc-900 hover:bg-zinc-800 text-center text-sm font-mono transition-colors"
                  >
                    VIEW ON DEXSCREENER →
                  </a>
                </div>
              </div>

              {/* Share */}
              <div className="border border-white/10 bg-zinc-950 p-6">
                <h2 className="font-mono text-xs text-zinc-500 mb-4">SHARE</h2>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${token.name} ($${token.symbol}) on @XEDscreener!\n\nhttps://xedscreener.xyz/token/${token.mint}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-3 bg-zinc-900 hover:bg-zinc-800 text-sm font-mono transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  SHARE ON X
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-xs font-mono text-zinc-600">
          <div>XED.SCREENER_V1.0</div>
          <div className="flex gap-6">
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TWITTER</a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
