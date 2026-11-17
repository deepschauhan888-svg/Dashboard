import type { FilterKey } from "@/lib/analytics/filters";

export const ANALYST_MODULE_SLUGS = ["demand", "supply", "price", "bhk", "ticket-size", "property-size", "micromarkets", "history", "comparison"] as const;
export type AnalystModuleSlug = (typeof ANALYST_MODULE_SLUGS)[number];
export type WorkspaceView = "executive" | AnalystModuleSlug;

/**
 * The same dashboard modules run in two modes:
 *  - "client"  : the signed-in workspace under /dashboard (protected)
 *  - "preview" : the public "Explore Platform" preview under /preview
 *                (demonstration data, no sign-in)
 */
export type WorkspaceMode = "client" | "preview";

export interface WorkspaceNavItem {
  view: WorkspaceView;
  label: string;
  /** contextual filters shown for this view — all others are reset to "all" */
  filters: FilterKey[];
}

const PERIOD: FilterKey[] = ["year", "quarter"];
const GEO: FilterKey[] = ["cityId", "micromarketId"];

export const executiveNav: WorkspaceNavItem = { view: "executive", label: "Executive Overview", filters: [...GEO, ...PERIOD] };

export const analystNav: WorkspaceNavItem[] = [
  { view: "demand", label: "Demand Analytics", filters: [...GEO, ...PERIOD, "bhk", "ticketBracket", "sizeBracket"] },
  { view: "supply", label: "Supply Analytics", filters: [...GEO, ...PERIOD, "bhk", "ticketBracket", "sizeBracket"] },
  { view: "price", label: "Price Intelligence", filters: [...GEO, ...PERIOD, "bhk"] },
  { view: "bhk", label: "BHK-wise Analysis", filters: [...GEO, ...PERIOD] },
  { view: "ticket-size", label: "Ticket Size Analysis", filters: [...GEO, ...PERIOD, "bhk"] },
  { view: "property-size", label: "Property Size Analysis", filters: [...GEO, ...PERIOD, "bhk"] },
  { view: "micromarkets", label: "Micromarket Intelligence", filters: ["cityId", ...PERIOD, "bhk"] },
  { view: "history", label: "Historical Trends", filters: [...GEO, "bhk"] },
  { view: "comparison", label: "Market Comparison", filters: [...PERIOD, "bhk"] },
];

export const allWorkspaceViews = [executiveNav, ...analystNav];

export function isAnalystSlug(s: string): s is AnalystModuleSlug {
  return (ANALYST_MODULE_SLUGS as readonly string[]).includes(s);
}

/** URL of a view in a given mode. */
export function hrefFor(view: WorkspaceView, mode: WorkspaceMode): string {
  if (mode === "preview") return view === "executive" ? "/preview" : `/preview/${view}`;
  return view === "executive" ? "/dashboard" : `/dashboard/analyst/${view}`;
}

/** Resolves the current view from a pathname in either mode. */
export function viewForPath(pathname: string): WorkspaceNavItem {
  const last = pathname.replace(/\/$/, "").split("/").pop() ?? "";
  return isAnalystSlug(last) ? viewBySlug(last) : executiveNav;
}

export function viewBySlug(view: WorkspaceView): WorkspaceNavItem {
  return allWorkspaceViews.find((v) => v.view === view) ?? executiveNav;
}
