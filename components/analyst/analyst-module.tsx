"use client";

import type { AnalystModuleSlug } from "@/lib/config/workspace-nav";
import { BhkModule } from "./bhk-module";
import { BracketModule } from "./bracket-module";
import { ComparisonModule } from "./comparison-module";
import { FlowModule } from "./flow-module";
import { HistoryModule } from "./history-module";
import { MicromarketModule } from "./micromarket-module";
import { PriceModule } from "./price-module";

/** Each module is its own workspace — one route, one analytical question. */
export function AnalystModule({ slug }: { slug: AnalystModuleSlug }) {
  switch (slug) {
    case "demand":
      return <FlowModule key="demand" metric="demand" />;
    case "supply":
      return <FlowModule key="supply" metric="supply" />;
    case "price":
      return <PriceModule />;
    case "bhk":
      return <BhkModule />;
    case "ticket-size":
      return <BracketModule key="ticket" dim="ticket" />;
    case "property-size":
      return <BracketModule key="size" dim="size" />;
    case "micromarkets":
      return <MicromarketModule />;
    case "history":
      return <HistoryModule />;
    case "comparison":
      return <ComparisonModule />;
  }
}
