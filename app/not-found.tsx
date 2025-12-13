import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
      <div className="scanline" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/explorer" className="text-sm text-zinc-400 hover:text-white transition-colors">Explorer</Link>
            <Link href="/start" className="text-sm text-zinc-400 hover:text-white transition-colors">Submit Token</Link>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-6">
          <div className="font-mono text-9xl font-bold text-zinc-800">404</div>
          <h1 className="text-3xl font-bold tracking-tight">PAGE NOT FOUND</h1>
          <p className="text-zinc-500 max-w-md font-mono text-sm">
            The requested resource could not be located on this server.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="px-8 py-3 bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors"
            >
              RETURN HOME
            </Link>
            <Link 
              href="/explorer" 
              className="px-8 py-3 border border-white/20 text-white font-mono text-xs hover:bg-white/5 transition-colors"
            >
              VIEW EXPLORER
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-zinc-700">
          ERROR_CODE: NOT_FOUND // STATUS: 404
        </div>
      </div>
    </main>
  );
}

