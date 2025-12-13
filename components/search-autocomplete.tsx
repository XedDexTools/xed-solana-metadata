"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  image: string | null;
};

type Props = {
  placeholder?: string;
  className?: string;
};

export function SearchAutocomplete({ placeholder = "Search tokens...", className = "" }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTokens = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchTokens, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      window.location.href = `/token/${results[selectedIndex].mint}`;
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-800 shadow-xl max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <Link
              key={result.id}
              href={`/token/${result.mint}`}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors ${
                index === selectedIndex ? "bg-zinc-800" : ""
              }`}
            >
              {result.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={result.image} alt={result.name} className="w-8 h-8 object-cover bg-zinc-800" />
              ) : (
                <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                  {result.symbol.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{result.name}</span>
                  <span className="text-xs font-mono text-zinc-500">${result.symbol}</span>
                </div>
                <p className="text-xs font-mono text-zinc-600 truncate">{result.mint}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-800 p-4 text-center">
          <p className="text-sm text-zinc-500">No tokens found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
