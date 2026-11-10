import type { FilterKey } from "@/lib/analytics/filters";

export const ANALYST_MODULE_SLUGS = ["demand", "supply", "price", "bhk", "ticket-size", "property-size", "micromarkets", "history", "comparison"] as const;
export type AnalystModuleSlug = (typeof ANALYST_MODULE_SLUGS)[number];
export type WorkspaceView = "executive" | AnalystModuleSlug;

export interface WorkspaceNavItem {
  view: WorkspaceView;
  href: string;
  label: string;
  /** contextual filters shown for this view — all others are reset to "all" */
  filters: FilterKey[];
}

const PERIOD: FilterKey[] = ["year", "quarter"];
const GEO: FilterKey[] = ["cityId", "micromarketId"];

export const executiveNav: WorkspaceNavItem = { view: "executive", href: "/dashboard", label: "Executive Overview", filters: [...GEO, ...PERIOD] };

export const analystNav: WorkspaceNavItem[] = [
  { view: "demand", href: "/dashboard/analyst/demand", label: "Demand Analytics", filters: [...GEO, ...PERIOD, "bhk", "ticketBracket", "sizeBracket"] },
  { view: "supply", href: "/dashboard/analyst/supply", label: "Supply Analytics", filters: [...GEO, ...PERIOD, "bhk", "ticketBracket", "sizeBracket"] },
  { view: "price", href: "/dashboard/analyst/price", label: "Price Intelligence", filters: [...GEO, ...PERIOD, "bhk"] },
  { view: "bhk", href: "/dashboard/analyst/bhk", label: "BHK-wise Analysis", filters: [...GEO, ...PERIOD] },
  { view: "ticket-size", href: "/dashboard/analyst/ticket-size", label: "Ticket Size Analysis", filters: [...GEO, ...PERIOD, "bhk"] },
  { view: "property-size", href: "/dashboard/analyst/property-size", label: "Property Size Analysis", filters: [...GEO, ...PERIOD, "bhk"] },
  { view: "micromarkets", href: "/dashboard/analyst/micromarkets", label: "Micromarket Analysis", filters: ["cityId", ...PERIOD, "bhk"] },
  { view: "history", href: "/dashboard/analyst/history", label: "Historical Analysis", filters: [...GEO, "bhk"] },
  { view: "comparison", href: "/dashboard/analyst/comparison", label: "Market Comparison", filters: [...PERIOD, "bhk"] },
];

export const allWorkspaceViews = [executiveNav, ...analystNav];

export function viewForPath(pathname: string): WorkspaceNavItem {
  return allWorkspaceViews.find((v) => v.href === pathname) ?? executiveNav;
}

export function viewBySlug(view: WorkspaceView): WorkspaceNavItem {
  return allWorkspaceViews.find((v) => v.view === view) ?? executiveNav;
}
