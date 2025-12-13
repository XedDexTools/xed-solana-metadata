"use client";

import { WatchlistButton } from "./watchlist-button";

type Props = {
  mint: string;
  name: string;
  symbol: string;
  image?: string | null;
};

export function TokenActions({ mint, name, symbol, image }: Props) {
  return (
    <div className="flex items-center gap-2">
      <WatchlistButton
        mint={mint}
        name={name}
        symbol={symbol}
        image={image}
        size="lg"
        showLabel
      />
    </div>
  );
}
