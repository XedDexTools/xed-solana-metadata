"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background Effects */}
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-30" />
      <div className="scanline" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 bg-white group-hover:bg-zinc-300 transition-colors" />
            <span className="font-bold tracking-tight text-lg">XED SCREENER</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="font-mono text-xs text-zinc-500">SYSTEM_DOCS_V1.2.4</span>
            <Link href="/start">
              <Button size="sm" className="h-8 px-4 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-wide text-xs">
                LAUNCH APP
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-[1400px] mx-auto flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 border-r border-white/10 p-8 hidden md:block fixed h-full bg-black overflow-y-auto pb-24">
          <div className="space-y-8 font-mono text-xs">
            <div>
              <h3 className="text-zinc-500 mb-4 uppercase tracking-widest">System Core</h3>
              <ul className="space-y-3">
                <li onClick={() => scrollToSection("architecture")} className="text-white cursor-pointer hover:text-green-400 transition-colors">:: Architecture</li>
                <li onClick={() => scrollToSection("data-flow")} className="text-zinc-400 cursor-pointer hover:text-white transition-colors">:: Data Flow</li>
                <li onClick={() => scrollToSection("security-model")} className="text-zinc-400 cursor-pointer hover:text-white transition-colors">:: Security Model</li>
              </ul>
            </div>
            <div>
              <h3 className="text-zinc-500 mb-4 uppercase tracking-widest">Interface</h3>
              <ul className="space-y-3">
                <li onClick={() => scrollToSection("api-reference")} className="text-zinc-400 cursor-pointer hover:text-white transition-colors">:: REST API</li>
                <li onClick={() => scrollToSection("error-handling")} className="text-zinc-400 cursor-pointer hover:text-white transition-colors">:: Error Handling</li>
              </ul>
            </div>
            <div>
              <h3 className="text-zinc-500 mb-4 uppercase tracking-widest">Storage</h3>
              <ul className="space-y-3">
                <li onClick={() => scrollToSection("database-schema")} className="text-zinc-400 cursor-pointer hover:text-white transition-colors">:: Schema Definition</li>
                <li onClick={() => scrollToSection("asset-storage")} className="text-zinc-400 cursor-pointer hover:text-white transition-colors">:: Asset Storage</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 p-8 md:p-16 space-y-20 bg-black pb-32">
          {/* Header */}
          <div className="space-y-6 border-b border-white/10 pb-12">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-mono text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 pulse-glow" />
                STATUS: ONLINE
              </div>
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-zinc-400">
                LAST_UPDATED: 2025-12-11
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">TECHNICAL SPECIFICATION</h1>
            <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed">
              Comprehensive documentation for the XED Screener infrastructure. 
              This registry serves as the immutable source of truth for SPL token metadata mapping, 
              providing high-availability access to asset information via decentralized storage endpoints.
            </p>
          </div>

          {/* Architecture Section */}
          <section id="architecture" className="space-y-8 scroll-mt-24">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">01 // System Architecture</h2>
              <span className="font-mono text-xs text-zinc-500">INFRA_V2</span>
            </div>
            
            <div className="bg-zinc-950 border border-white/10 p-8 font-mono text-xs text-zinc-400 overflow-x-auto">
<pre>{`
+----------------+       +-------------------+       +---------------------+
|  CLIENT LAYER  | ----> |  EDGE MIDDLEWARE  | ----> |  PERSISTENCE LAYER  |
+----------------+       +-------------------+       +---------------------+
|                |       |                   |       |                     |
|  React / UI    |       |  Next.js API      |       |  Supabase DB (PG)   |
|  (Start Page)  |       |  (Rate Limiting)  |       |  (Token Records)    |
|                |       |  (Validation)     |       |                     |
+-------+--------+       +---------+---------+       +----------+----------+
        |                          |                            |
        | Direct Upload            | Auth / Write               | Read / Query
        v                          v                            v
+-------+--------+       +---------+---------+       +----------+----------+
| OBJECT STORAGE |       |  SECURITY MODULE  |       |  PUBLIC ENDPOINTS   |
+----------------+       +-------------------+       +---------------------+
|                |       |                   |       |                     |
| Supabase Buckets|      |  Cooldown Logic   |       |  GET /api/token     |
| (Images/Assets)|       |  Admin Gate       |       |  (CDN Cached)       |
|                |       |                   |       |                     |
+----------------+       +-------------------+       +---------------------+
`}</pre>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-white/10 bg-zinc-900/20 p-6 space-y-4">
                <h3 className="font-mono text-sm text-zinc-400 border-b border-white/10 pb-2">EXECUTION ENVIRONMENT</h3>
                <ul className="space-y-3 text-sm font-mono text-zinc-300">
                  <li className="flex justify-between"><span>Runtime</span> <span className="text-zinc-500">Node.js / Edge</span></li>
                  <li className="flex justify-between"><span>Region</span> <span className="text-zinc-500">Global / Distributed</span></li>
                  <li className="flex justify-between"><span>Latency</span> <span className="text-zinc-500">&lt;50ms (p99)</span></li>
                  <li className="flex justify-between"><span>Consistency</span> <span className="text-zinc-500">Strong (Write) / Eventual (Read)</span></li>
                </ul>
              </div>
              <div className="border border-white/10 bg-zinc-900/20 p-6 space-y-4">
                <h3 className="font-mono text-sm text-zinc-400 border-b border-white/10 pb-2">DEPENDENCIES</h3>
                <ul className="space-y-3 text-sm font-mono text-zinc-300">
                  <li className="flex justify-between"><span>@supabase/js</span> <span className="text-zinc-500">v2.39.0</span></li>
                  <li className="flex justify-between"><span>next</span> <span className="text-zinc-500">v16.0.7</span></li>
                  <li className="flex justify-between"><span>react</span> <span className="text-zinc-500">v19.0.0</span></li>
                  <li className="flex justify-between"><span>tailwindcss</span> <span className="text-zinc-500">v4.0.0</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Security Model */}
          <section id="security-model" className="space-y-8 scroll-mt-24">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">02 // Security & Validation</h2>
              <span className="font-mono text-xs text-zinc-500">SEC_LEVEL_HIGH</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 border border-white/10 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
                <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center mb-4 font-bold text-xs">01</div>
                <h3 className="font-bold text-lg mb-2">Input Sanitization</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  All incoming payloads undergo strict type checking and sanitization. Base58 addresses are regex-validated before processing to prevent injection attacks.
                </p>
              </div>
              <div className="p-6 border border-white/10 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
                <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center mb-4 font-bold text-xs">02</div>
                <h3 className="font-bold text-lg mb-2">Rate Limiting</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Submissions are throttled via a sliding window algorithm keyed by `wallet` + `mint` pairs.
                  <br/><br/>
                  <span className="font-mono text-xs bg-red-900/20 text-red-400 px-2 py-1">LIMIT: 1 REQ / 10800 SEC</span>
                </p>
              </div>
              <div className="p-6 border border-white/10 bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
                <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center mb-4 font-bold text-xs">03</div>
                <h3 className="font-bold text-lg mb-2">Asset Verification</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Image assets are isolated in a public storage bucket with strict CORS policies. Max file size constraints (5MB) are enforced at the upload edge.
                </p>
              </div>
            </div>
          </section>

          {/* API Reference */}
          <section id="api-reference" className="space-y-8 scroll-mt-24">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">03 // API Endpoints</h2>
              <span className="font-mono text-xs text-zinc-500">REST_V1</span>
            </div>
            
            <div className="space-y-12">
              {/* POST /api/submit */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="bg-green-500 text-black px-3 py-1 font-bold font-mono text-sm">POST</span>
                  <span className="font-mono text-lg text-white">/api/submit</span>
                </div>
                <div className="border-l-2 border-zinc-800 pl-6 space-y-6">
                  <p className="text-zinc-400 max-w-2xl">
                    Primary ingestion endpoint for metadata registration. Handles cooldown checks, validation, and database persistence.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-zinc-500 uppercase">Request Body</div>
                      <pre className="bg-zinc-950 p-4 border border-white/5 text-xs text-zinc-300 overflow-x-auto font-mono">
{`{
  "wallet": "So111...111",  // required, base58
  "mint": "EPjFW...e76",    // required, base58
  "name": "USD Coin",       // required, max 80
  "symbol": "USDC",         // required, max 10
  "description": "Stable...", // required
  "image": "https://...",   // required, url
  "socials": {              // optional
    "twitter": "@circle",
    "website": "circle.com"
  }
}`}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-zinc-500 uppercase">Success Response (200)</div>
                      <pre className="bg-zinc-950 p-4 border border-white/5 text-xs text-green-400 overflow-x-auto font-mono">
{`{
  "success": true,
  "id": "550e8400-e29b...",
  "timestamp": 1715421234,
  "status": "pending"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* GET /api/token */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-500 text-black px-3 py-1 font-bold font-mono text-sm">GET</span>
                  <span className="font-mono text-lg text-white">/api/token</span>
                </div>
                <div className="border-l-2 border-zinc-800 pl-6 space-y-6">
                  <p className="text-zinc-400 max-w-2xl">
                    Public resolution endpoint. Returns the latest <strong>approved</strong> metadata for a given mint address. Used by wallets and explorers.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-zinc-500 uppercase">Query Parameters</div>
                    <div className="border border-white/10 bg-zinc-950">
                      <div className="grid grid-cols-3 border-b border-white/10 p-2 text-xs font-mono text-zinc-500">
                        <div>PARAM</div>
                        <div>TYPE</div>
                        <div>DESCRIPTION</div>
                      </div>
                      <div className="grid grid-cols-3 p-2 text-xs font-mono text-zinc-300">
                        <div className="text-white">mint</div>
                        <div>string</div>
                        <div>The Solana mint address to resolve.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Database Schema */}
          <section id="database-schema" className="space-y-8 scroll-mt-24">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold uppercase tracking-wide">04 // Data Models</h2>
              <span className="font-mono text-xs text-zinc-500">PG_SCHEMA</span>
            </div>
            
            <div className="border border-white/10 bg-black">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-900/30">
                    <th className="p-4 font-mono text-zinc-500 uppercase">Column Name</th>
                    <th className="p-4 font-mono text-zinc-500 uppercase">Data Type</th>
                    <th className="p-4 font-mono text-zinc-500 uppercase">Constraint</th>
                    <th className="p-4 font-mono text-zinc-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  <tr className="hover:bg-zinc-900/20">
                    <td className="p-4 text-white">id</td>
                    <td className="p-4 text-blue-400">uuid</td>
                    <td className="p-4 text-zinc-500">PK, DEFAULT gen_random_uuid()</td>
                    <td className="p-4 text-zinc-400">Unique record identifier</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="p-4 text-white">created_at</td>
                    <td className="p-4 text-blue-400">timestamptz</td>
                    <td className="p-4 text-zinc-500">DEFAULT now()</td>
                    <td className="p-4 text-zinc-400">Submission timestamp (used for cooldowns)</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="p-4 text-white">wallet</td>
                    <td className="p-4 text-blue-400">varchar(44)</td>
                    <td className="p-4 text-zinc-500">NOT NULL</td>
                    <td className="p-4 text-zinc-400">Submitter's public key</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="p-4 text-white">mint</td>
                    <td className="p-4 text-blue-400">varchar(44)</td>
                    <td className="p-4 text-zinc-500">NOT NULL</td>
                    <td className="p-4 text-zinc-400">Target token mint address</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="p-4 text-white">metadata_blob</td>
                    <td className="p-4 text-blue-400">jsonb</td>
                    <td className="p-4 text-zinc-500"></td>
                    <td className="p-4 text-zinc-400">Flexible storage for name, symbol, description</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/20">
                    <td className="p-4 text-white">status</td>
                    <td className="p-4 text-blue-400">enum</td>
                    <td className="p-4 text-zinc-500">DEFAULT 'pending'</td>
                    <td className="p-4 text-zinc-400">Lifecycle state (pending → approved/rejected)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer Note */}
          <div className="border-t border-white/10 pt-12 text-center text-zinc-600 font-mono text-xs">
            <p>XED_SCREENER_SYSTEM // END_OF_FILE</p>
            <p className="mt-2">CONFIDENTIALITY_LEVEL: PUBLIC</p>
          </div>

        </div>
      </div>
    </main>
  );
}
