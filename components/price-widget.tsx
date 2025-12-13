"use client";

import { useState } from "react";
import { LivePriceTicker } from "./live-price-ticker";
import { PriceChartModal } from "./price-chart-modal";

export function PriceWidget() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <>
      <LivePriceTicker onTokenClick={(symbol) => setSelectedSymbol(symbol)} />
      <PriceChartModal
        symbol={selectedSymbol || "SOL"}
        isOpen={selectedSymbol !== null}
        onClose={() => setSelectedSymbol(null)}
      />
    </>
  );
}

