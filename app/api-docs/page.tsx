"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PriceWidget } from "@/components/price-widget";

type Endpoint = {
  method: "GET" | "POST";
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  example: string;
};

const API_BASE = "https://xedscreener.xyz/api";

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/search",
    description: "Search for tokens by name, symbol, or mint address",
    params: [
      { name: "q", type: "string", required: true, description: "Search query (min 2 characters)" },
    ],
    response: `{
  "results": [
    {
      "id": "uuid",
      "mint": "So11111111111111111111111111111111111111112",
      "name": "Token Name",
      "symbol": "TKN",
      "image": "https://..."
    }
  ]
}`,
    example: `fetch("${API_BASE}/search?q=solana")
  .then(res => res.json())
  .then(data => console.log(data.results))`,
  },
  {
    method: "GET",
    path: "/api/explorer",
    description: "Get a paginated list of all approved tokens",
    params: [
      { name: "page", type: "number", required: false, description: "Page number (default: 1)" },
      { name: "limit", type: "number", required: false, description: "Items per page (default: 20, max: 100)" },
      { name: "search", type: "string", required: false, description: "Filter by name/symbol/mint" },
      { name: "sort", type: "string", required: false, description: "Sort order: newest, oldest, name" },
    ],
    response: `{
  "tokens": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}`,
    example: `fetch("${API_BASE}/explorer?page=1&limit=10&sort=newest")
  .then(res => res.json())
  .then(data => console.log(data.tokens))`,
  },
  {
    method: "GET",
    path: "/api/token",
    description: "Get detailed information about a specific token",
    params: [
      { name: "mint", type: "string", required: true, description: "Token mint address" },
    ],
    response: `{
  "found": true,
  "token": {
    "id": "uuid",
    "mint": "...",
    "name": "Token Name",
    "symbol": "TKN",
    "description": "...",
    "image": "https://...",
    "twitter": "@handle",
    "telegram": "t.me/...",
    "website": "https://...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}`,
    example: `fetch("${API_BASE}/token?mint=So111...")
  .then(res => res.json())
  .then(data => console.log(data.token))`,
  },
  {
    method: "GET",
    path: "/api/activity",
    description: "Get recent token activity (latest approvals)",
    params: [],
    response: `{
  "activities": [
    {
      "id": "uuid",
      "type": "approved",
      "name": "Token Name",
      "symbol": "TKN",
      "mint": "...",
      "image": "https://...",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}`,
    example: `fetch("${API_BASE}/activity")
  .then(res => res.json())
  .then(data => console.log(data.activities))`,
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "Get registry statistics",
    params: [],
    response: `{
  "approved": 150,
  "total": 200
}`,
    example: `fetch("${API_BASE}/stats")
  .then(res => res.json())
  .then(data => console.log(data))`,
  },
  {
    method: "GET",
    path: "/api/status",
    description: "Check submission status by mint or wallet address",
    params: [
      { name: "mint", type: "string", required: false, description: "Token mint address" },
      { name: "wallet", type: "string", required: false, description: "Submitter wallet address" },
    ],
    response: `{
  "found": true,
  "submissions": [
    {
      "id": "uuid",
      "mint": "...",
      "name": "Token Name",
      "symbol": "TKN",
      "status": "approved",
      "submittedAt": "2024-01-01T00:00:00Z"
    }
  ]
}`,
    example: `fetch("${API_BASE}/status?mint=So111...")
  .then(res => res.json())
  .then(data => console.log(data.submissions))`,
  },
];

function CodeBlock({ code, language = "javascript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 border border-zinc-800 p-4 overflow-x-auto text-sm">
        <code className="text-zinc-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-zinc-800 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700"
      >
        {copied ? "COPIED!" : "COPY"}
      </button>
    </div>
  );
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-zinc-800 bg-zinc-950">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-zinc-900 transition-colors text-left"
      >
        <span className={`px-2 py-1 text-xs font-mono font-bold ${
          endpoint.method === "GET" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
        }`}>
          {endpoint.method}
        </span>
        <code className="font-mono text-sm flex-1">{endpoint.path}</code>
        <span className="text-zinc-500 text-sm hidden md:block">{endpoint.description}</span>
        <span className="text-zinc-500">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          <p className="text-zinc-400 text-sm">{endpoint.description}</p>

          {endpoint.params && endpoint.params.length > 0 && (
            <div>
              <h4 className="text-xs font-mono text-zinc-500 mb-2">PARAMETERS</h4>
              <div className="space-y-2">
                {endpoint.params.map((param) => (
                  <div key={param.name} className="flex items-start gap-3 text-sm">
                    <code className="font-mono text-white bg-zinc-900 px-2 py-0.5">{param.name}</code>
                    <span className="text-zinc-500">{param.type}</span>
                    {param.required && <span className="text-red-400 text-xs">required</span>}
                    <span className="text-zinc-400 flex-1">{param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-mono text-zinc-500 mb-2">RESPONSE</h4>
            <CodeBlock code={endpoint.response} language="json" />
          </div>

          <div>
            <h4 className="text-xs font-mono text-zinc-500 mb-2">EXAMPLE</h4>
            <CodeBlock code={endpoint.example} language="javascript" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 arc-grid pointer-events-none z-0 opacity-20" />
      <div className="scanline" />

      {/* Navbar */}
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
            <Link href="/explorer" className="text-sm text-zinc-400 hover:text-white transition-colors">Explorer</Link>
            <Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">Docs</Link>
            <a href="https://x.com/XEDscreener" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 border-b border-white/10 bg-zinc-950 py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono">PUBLIC API</span>
            <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs font-mono">v1.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">API Documentation</h1>
          <p className="text-zinc-400 max-w-2xl">
            Access XED Screener data programmatically. All endpoints are free to use with reasonable rate limits.
            No authentication required for read operations.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div>
                  <h3 className="text-xs font-mono text-zinc-500 mb-3">BASE URL</h3>
                  <code className="text-sm font-mono bg-zinc-900 px-3 py-2 block border border-zinc-800">
                    {API_BASE}
                  </code>
                </div>

                <div>
                  <h3 className="text-xs font-mono text-zinc-500 mb-3">ENDPOINTS</h3>
                  <div className="space-y-1">
                    {ENDPOINTS.map((ep) => (
                      <a
                        key={ep.path}
                        href={`#${ep.path.replace("/api/", "")}`}
                        className="block text-sm text-zinc-400 hover:text-white transition-colors py-1"
                      >
                        {ep.path}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-mono text-zinc-500 mb-3">RATE LIMITS</h3>
                  <p className="text-sm text-zinc-400">
                    100 requests per minute per IP. Contact us for higher limits.
                  </p>
                </div>

                <Link href="/start">
                  <Button className="w-full h-10 bg-white text-black hover:bg-zinc-200 rounded-none font-bold text-xs">
                    SUBMIT A TOKEN →
                  </Button>
                </Link>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Getting Started</h2>
                <p className="text-zinc-400 mb-4">
                  The XED Screener API allows you to fetch token metadata, search the registry, and check submission status.
                  All responses are in JSON format.
                </p>
                <CodeBlock code={`// Quick example: Fetch all approved tokens
const response = await fetch("${API_BASE}/explorer");
const data = await response.json();
console.log(data.tokens);`} />
              </div>

              <h2 className="text-xl font-bold mb-4">Endpoints</h2>
              {ENDPOINTS.map((endpoint) => (
                <div key={endpoint.path} id={endpoint.path.replace("/api/", "")}>
                  <EndpointCard endpoint={endpoint} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-xs font-mono text-zinc-600">
          <div>XED.SCREENER_API_V1.0</div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <a href="https://github.com/XedDexTools/xed-solana-metadata" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
