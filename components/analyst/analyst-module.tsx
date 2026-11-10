"use client";

import type { AnalystModuleSlug } from "@/lib/config/workspace-nav";
import { BracketModule } from "./bracket-module";
import { ConfigurationModule } from "./configuration-module";
import { FlowModule } from "./flow-module";
import { HistoryModule } from "./history-module";
import { MicromarketModule } from "./micromarket-module";
import { PriceModule } from "./price-module";

export function AnalystModule({ slug }: { slug: AnalystModuleSlug }) {
  switch (slug) {
    case "demand":
      return <FlowModule key="demand" metric="demand" />;
    case "supply":
      return <FlowModule key="supply" metric="supply" />;
    case "price":
      return <PriceModule />;
    case "configuration":
      return <ConfigurationModule />;
    case "ticket-size":
      return <BracketModule key="ticket" dim="ticket" />;
    case "size":
      return <BracketModule key="size" dim="size" />;
    case "micromarkets":
      return <MicromarketModule />;
    case "history":
      return <HistoryModule />;
  }
}
