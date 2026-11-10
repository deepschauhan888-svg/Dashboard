export interface WorkspaceNavItem {
  href: string;
  label: string;
  code: string;
  icon:
    | "overview"
    | "demand"
    | "supply"
    | "price"
    | "configuration"
    | "ticket"
    | "size"
    | "micromarket"
    | "history";
}

export const executiveNav: WorkspaceNavItem[] = [{ href: "/dashboard", label: "Executive Overview", code: "EX", icon: "overview" }];

export const analystNav: WorkspaceNavItem[] = [
  { href: "/dashboard/analyst/demand", label: "Demand Analytics", code: "A", icon: "demand" },
  { href: "/dashboard/analyst/supply", label: "Supply Analytics", code: "B", icon: "supply" },
  { href: "/dashboard/analyst/price", label: "Price Intelligence", code: "C", icon: "price" },
  { href: "/dashboard/analyst/configuration", label: "Configuration", code: "D", icon: "configuration" },
  { href: "/dashboard/analyst/ticket-size", label: "Ticket Size", code: "E", icon: "ticket" },
  { href: "/dashboard/analyst/size", label: "Size Intelligence", code: "F", icon: "size" },
  { href: "/dashboard/analyst/micromarkets", label: "Micromarkets", code: "G", icon: "micromarket" },
  { href: "/dashboard/analyst/history", label: "Historical Analysis", code: "H", icon: "history" },
];

export const ANALYST_MODULE_SLUGS = ["demand", "supply", "price", "configuration", "ticket-size", "size", "micromarkets", "history"] as const;
export type AnalystModuleSlug = (typeof ANALYST_MODULE_SLUGS)[number];
