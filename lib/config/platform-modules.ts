/** Narrative content for the Platform / Capabilities page. */

export interface PlatformModule {
  id: string;
  code: string;
  title: string;
  headline: string;
  explanation: string;
  application: string;
  useCases: string[];
  chartTitle: string;
  workspaceHref: string;
}

export const platformModules: PlatformModule[] = [
  {
    id: "demand",
    code: "M-01",
    title: "Demand Analytics",
    headline: "Know where buyers are — before the launch, not after.",
    explanation: "Quarterly buyer demand by city, micromarket, configuration, budget and unit size, with growth rates and seasonal patterns.",
    application: "Size the addressable market for a project and time launches to demand cycles.",
    useCases: ["Land acquisition screening", "Launch timing", "Sales velocity planning"],
    chartTitle: "Demand vs supply, quarterly",
    workspaceHref: "/dashboard/analyst/demand",
  },
  {
    id: "supply",
    code: "M-02",
    title: "Supply Analytics",
    headline: "See the competition entering your catchment.",
    explanation: "New supply by geography and product format, so pipeline pressure is visible city by city.",
    application: "Avoid launching into saturated segments and identify thinly supplied ones.",
    useCases: ["Competitive benchmarking", "Absorption risk assessment", "Phasing decisions"],
    chartTitle: "Demand and supply units by city",
    workspaceHref: "/dashboard/analyst/supply",
  },
  {
    id: "price",
    code: "M-03",
    title: "Price Analytics",
    headline: "Price with evidence, not anecdotes.",
    explanation: "Supply-weighted ₹/sq ft trajectories with year-on-year appreciation at city, micromarket and configuration level.",
    application: "Set launch pricing and escalation plans that the market will absorb.",
    useCases: ["Launch pricing", "Price escalation planning", "Valuation support"],
    chartTitle: "Average price and YoY appreciation",
    workspaceHref: "/dashboard/analyst/price",
  },
  {
    id: "configuration",
    code: "M-04",
    title: "BHK-wise Analytics",
    headline: "Build the homes the market is short of.",
    explanation: "Demand share against supply share for 1, 2, 3 and 4+ BHK, with the gap in percentage points.",
    application: "Design the unit mix of a project around measurable configuration gaps.",
    useCases: ["Unit-mix design", "Product repositioning", "Inventory rebalancing"],
    chartTitle: "Demand share vs supply share by configuration",
    workspaceHref: "/dashboard/analyst/configuration",
  },
  {
    id: "ticket",
    code: "M-05",
    title: "Ticket-size Analytics",
    headline: "Meet buyers inside their budget.",
    explanation: "Demand and supply across configurable budget brackets, with the mismatch between where buyers search and where homes are priced.",
    application: "Calibrate unit sizes and specifications to land in under-served budget brackets.",
    useCases: ["Budget-bracket targeting", "Specification planning", "Payment-plan design"],
    chartTitle: "Demand–supply gap by budget bracket (pp)",
    workspaceHref: "/dashboard/analyst/ticket-size",
  },
  {
    id: "size",
    code: "M-06",
    title: "Size-wise Analytics",
    headline: "Right-size every unit.",
    explanation: "Demand and supply across property area ranges, configurable to compact or large-format views.",
    application: "Optimise carpet areas so units meet both preference and price-point.",
    useCases: ["Floor-plate planning", "Efficiency benchmarking", "Large-format feasibility"],
    chartTitle: "Demand share vs supply share by unit size",
    workspaceHref: "/dashboard/analyst/size",
  },
  {
    id: "city",
    code: "M-07",
    title: "City Intelligence",
    headline: "Compare cities on one consistent scale.",
    explanation: "Every city measured with identical definitions — demand, supply, price, appreciation, inventory and demand–supply balance.",
    application: "Allocate capital and land banks across cities with a like-for-like view.",
    useCases: ["Portfolio allocation", "New-city entry", "Board reporting"],
    chartTitle: "Price appreciation YoY by city",
    workspaceHref: "/dashboard",
  },
  {
    id: "micromarket",
    code: "M-08",
    title: "Micromarket Intelligence",
    headline: "The market that matters is the one around your site.",
    explanation: "Locality-level indicators and multi-micromarket comparison across demand, supply, prices, configuration mix and budget mix.",
    application: "Choose between candidate sites and position a project against its immediate competition.",
    useCases: ["Site selection", "Catchment analysis", "Micro-positioning"],
    chartTitle: "Most supply-constrained micromarkets (demand ÷ supply)",
    workspaceHref: "/dashboard/analyst/micromarkets",
  },
  {
    id: "history",
    code: "M-09",
    title: "Historical Trends",
    headline: "Read the cycle, not just the quarter.",
    explanation: "Navigate years and quarters, overlay years to isolate seasonality, and compare any two periods directly.",
    application: "Separate structural shifts from seasonal noise before committing to a plan.",
    useCases: ["Cycle analysis", "Seasonality planning", "Period-on-period reporting"],
    chartTitle: "Demand by quarter, year over year",
    workspaceHref: "/dashboard/analyst/history",
  },
  {
    id: "comparison",
    code: "M-10",
    title: "Market Comparison",
    headline: "Put markets side by side.",
    explanation: "Select multiple markets and compare every indicator on shared axes, with consistent colours for each market throughout.",
    application: "Benchmark a target micromarket against alternatives and peers.",
    useCases: ["Site shortlisting", "Investment committee packs", "Peer benchmarking"],
    chartTitle: "Average price trajectory — three micromarkets",
    workspaceHref: "/dashboard/analyst/micromarkets",
  },
];
