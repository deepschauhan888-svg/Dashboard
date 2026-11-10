/**
 * Platform page content — the ONLY place module descriptions live.
 */

export interface PlatformModule {
  id: string;
  n: string;
  title: string;
  description: string;
  capabilities: string[];
  useCase: string;
  chartTitle: string;
  workspaceHref: string;
}

export const platformModules: PlatformModule[] = [
  {
    id: "demand",
    n: "01",
    title: "Demand Intelligence",
    description: "Quarterly buyer demand for every city and micromarket, broken down by configuration, budget and unit size.",
    capabilities: ["Quarter-on-quarter and year-on-year growth", "Demand by BHK, ticket size and unit size", "Micromarket demand ranking", "Shifts in demand mix over time"],
    useCase: "A developer sizing a new launch sees how much buyer demand the catchment generates and whether it is growing.",
    chartTitle: "Demand and supply, quarterly",
    workspaceHref: "/dashboard/analyst/demand",
  },
  {
    id: "supply",
    n: "02",
    title: "Supply Intelligence",
    description: "New residential supply entering each market, by format and price point, measured on the same basis as demand.",
    capabilities: ["Supply growth by quarter", "Supply by configuration, budget and size", "Micromarket supply concentration", "Unsold inventory at period end"],
    useCase: "Before acquiring land, a team checks how much competing stock is entering the same budget bracket.",
    chartTitle: "Demand and supply units by city",
    workspaceHref: "/dashboard/analyst/supply",
  },
  {
    id: "price",
    n: "03",
    title: "Price Intelligence",
    description: "Supply-weighted price per square foot and its appreciation, at city, micromarket and configuration level.",
    capabilities: ["Quarterly price movement", "Annual appreciation", "Micromarket price comparison", "Price distribution by ₹/sq ft band", "Prices by configuration"],
    useCase: "A pricing committee benchmarks a launch price against comparable configurations in the same micromarket.",
    chartTitle: "Average price and year-on-year appreciation",
    workspaceHref: "/dashboard/analyst/price",
  },
  {
    id: "configuration",
    n: "04",
    title: "Configuration Intelligence",
    description: "Demand and supply for 1, 2, 3 and 4+ BHK homes, and the gap between what buyers want and what is being built.",
    capabilities: ["Share of demand vs share of supply", "Gap in percentage points", "Configuration × budget heatmap", "Mix shift over eight quarters"],
    useCase: "A design team sets the unit mix of a tower around the configurations the micromarket is short of.",
    chartTitle: "Demand share vs supply share by configuration",
    workspaceHref: "/dashboard/analyst/bhk",
  },
  {
    id: "ticket",
    n: "05",
    title: "Ticket Size Intelligence",
    description: "Where buyers' budgets sit against where supply is priced, across brackets the user can redefine.",
    capabilities: ["Preset and custom budget brackets", "Demand and supply share by bracket", "Market imbalance by bracket", "Quarter-on-quarter change in share"],
    useCase: "A developer adjusts unit sizes so that the final ticket lands in an under-served budget bracket.",
    chartTitle: "Demand–supply gap by budget bracket",
    workspaceHref: "/dashboard/analyst/ticket-size",
  },
  {
    id: "size",
    n: "06",
    title: "Property Size Intelligence",
    description: "Demand and supply across carpet-area ranges, with compact and large-format views.",
    capabilities: ["Preset and custom area ranges", "Share of demand vs supply by size", "Imbalance by size range", "Size preferences over time"],
    useCase: "An architect tests whether a 1,150 sq ft three-bedroom plan matches the sizes buyers are searching for.",
    chartTitle: "Demand share vs supply share by unit size",
    workspaceHref: "/dashboard/analyst/property-size",
  },
  {
    id: "city",
    n: "07",
    title: "City Intelligence",
    description: "Every city measured with identical definitions, so markets can be ranked and compared on equal terms.",
    capabilities: ["City-level demand, supply and price", "Appreciation ranking", "Demand–supply balance", "Drill-down from city to micromarket"],
    useCase: "A listed developer allocates its land bank across cities using a like-for-like view of market depth.",
    chartTitle: "Year-on-year price appreciation by city",
    workspaceHref: "/dashboard",
  },
  {
    id: "micromarket",
    n: "08",
    title: "Micromarket Intelligence",
    description: "Locality-level analysis within a city: rankings, balance and how each micromarket has moved quarter by quarter.",
    capabilities: ["Micromarket ranking table", "Demand–supply heatmap by quarter", "Share of city demand", "Price vs appreciation positioning"],
    useCase: "A land team chooses between two candidate sites by comparing the depth and momentum of their micromarkets.",
    chartTitle: "Most supply-constrained micromarkets",
    workspaceHref: "/dashboard/analyst/micromarkets",
  },
  {
    id: "history",
    n: "09",
    title: "Historical Trends",
    description: "The complete quarterly history, with year-on-year overlays and direct comparison of any two periods.",
    capabilities: ["Full quarterly series", "Year-over-year seasonal overlay", "Annual summaries", "Custom period A vs period B"],
    useCase: "A strategy team separates a structural slowdown from normal monsoon-quarter seasonality.",
    chartTitle: "Demand by quarter, year over year",
    workspaceHref: "/dashboard/analyst/history",
  },
  {
    id: "comparison",
    n: "10",
    title: "Market Comparison",
    description: "Up to five cities or micromarkets side by side on every indicator, each keeping a consistent colour.",
    capabilities: ["City or micromarket comparison", "Demand, supply and price trends", "Configuration and budget mix", "Exportable comparison table"],
    useCase: "An investment committee pack benchmarks a target micromarket against its closest alternatives.",
    chartTitle: "Average price trajectory — three micromarkets",
    workspaceHref: "/dashboard/analyst/comparison",
  },
];
