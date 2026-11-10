"use client";

/**
 * DEMO admin state. Everything here lives in this browser only (localStorage)
 * and stands in for the future admin API. Organisation names are fictional.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ValidationReport } from "./dataset-validation";
import { getDemoService } from "@/lib/services";

export type UploadStatus = "published" | "validated" | "failed" | "rolled_back" | "superseded";

export interface UploadRecord {
  id: string;
  version: number;
  fileName: string;
  datasetType: string;
  period: string;
  cityId: string;
  rows: number;
  status: UploadStatus;
  uploadedBy: string;
  uploadedAt: string;
  errors: number;
  warnings: number;
}

export interface AdminCity {
  id: string;
  name: string;
  state: string;
  region: string;
  coverage: "live" | "illustrative" | "planned" | "hidden";
  micromarkets: number;
}

export interface AdminMicromarket {
  id: string;
  name: string;
  cityId: string;
  aliases: string;
  active: boolean;
}

export interface AdminClient {
  id: string;
  name: string;
  type: "Developer" | "Financial Institution" | "Consultancy" | "Institution";
  users: number;
  plan: string;
  status: "active" | "trial" | "suspended";
  renewal: string;
}

export interface Plan {
  id: string;
  name: string;
  cities: number | "all";
  modules: string[];
  seats: number;
  exports: boolean;
}

export type Role = "Client analyst" | "Client admin" | "MB analyst" | "MB administrator";
export type Capability = "View dashboards" | "Analyst workspace" | "Export data" | "Manage users" | "Upload datasets" | "Publish datasets" | "Manage clients" | "Platform settings";

export interface Settings {
  maintenanceMode: boolean;
  showDemoBanner: boolean;
  allowExports: boolean;
  requireMfa: boolean;
  sessionTimeoutMins: number;
  dataProvider: "demo" | "api";
  defaultPeriodLatest: boolean;
}

interface AdminState {
  uploads: UploadRecord[];
  cities: AdminCity[];
  micromarkets: AdminMicromarket[];
  clients: AdminClient[];
  plans: Plan[];
  permissions: Record<Role, Capability[]>;
  settings: Settings;
  lastReport: ValidationReport | null;
}

export const ROLES: Role[] = ["Client analyst", "Client admin", "MB analyst", "MB administrator"];
export const CAPABILITIES: Capability[] = ["View dashboards", "Analyst workspace", "Export data", "Manage users", "Upload datasets", "Publish datasets", "Manage clients", "Platform settings"];

function seed(): AdminState {
  const cat = getDemoService().catalogSync();
  const cities: AdminCity[] = cat.cities.map((c) => ({ id: c.city_id, name: c.city_name, state: c.state, region: c.region, coverage: "illustrative", micromarkets: c.micromarkets.length }));
  const micromarkets: AdminMicromarket[] = cat.cities.flatMap((c) => c.micromarkets.map((m) => ({ id: m.micromarket_id, name: m.micromarket_name, cityId: c.city_id, aliases: "", active: true })));
  const plans: Plan[] = [
    { id: "essential", name: "Essential", cities: 1, modules: ["Executive overview", "Demand", "Supply", "Price"], seats: 3, exports: false },
    { id: "professional", name: "Professional", cities: 3, modules: ["All analyst modules"], seats: 10, exports: true },
    { id: "enterprise", name: "Enterprise", cities: "all", modules: ["All modules", "Custom research", "API access"], seats: 50, exports: true },
  ];
  const clients: AdminClient[] = [
    { id: "c1", name: "Demo Developer A (fictional)", type: "Developer", users: 8, plan: "professional", status: "active", renewal: "2027-03-31" },
    { id: "c2", name: "Demo Developer B (fictional)", type: "Developer", users: 3, plan: "essential", status: "trial", renewal: "2026-12-15" },
    { id: "c3", name: "Demo Lender C (fictional)", type: "Financial Institution", users: 14, plan: "enterprise", status: "active", renewal: "2027-06-30" },
    { id: "c4", name: "Demo Advisory D (fictional)", type: "Consultancy", users: 5, plan: "professional", status: "active", renewal: "2027-01-31" },
    { id: "c5", name: "Demo Institute E (fictional)", type: "Institution", users: 2, plan: "essential", status: "suspended", renewal: "2026-09-30" },
  ];
  const uploads: UploadRecord[] = [];
  let v = 1;
  for (const [y, q] of [[2025, 4], [2026, 1], [2026, 2], [2026, 3]] as [number, number][]) {
    uploads.unshift({
      id: `u${v}`,
      version: v,
      fileName: `market_facts_${y}_Q${q}.csv`,
      datasetType: "market_facts",
      period: `Q${q} ${y}`,
      cityId: "all",
      rows: 1000 + v * 3,
      status: y === 2026 && q === 3 ? "published" : "superseded",
      uploadedBy: "Demo MB Administrator",
      uploadedAt: new Date(Date.UTC(y, q * 3, 8, 10, 30)).toISOString(),
      errors: 0,
      warnings: v % 2,
    });
    v++;
  }
  return {
    uploads,
    cities,
    micromarkets,
    clients,
    plans,
    permissions: {
      "Client analyst": ["View dashboards", "Analyst workspace", "Export data"],
      "Client admin": ["View dashboards", "Analyst workspace", "Export data", "Manage users"],
      "MB analyst": ["View dashboards", "Analyst workspace", "Export data", "Upload datasets"],
      "MB administrator": [...CAPABILITIES],
    },
    settings: { maintenanceMode: false, showDemoBanner: true, allowExports: true, requireMfa: false, sessionTimeoutMins: 60, dataProvider: "demo", defaultPeriodLatest: true },
    lastReport: null,
  };
}

const KEY = "mbri.admin-demo-state.v1";

interface AdminContextValue extends AdminState {
  update: (fn: (s: AdminState) => AdminState) => void;
  resetDemo: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(() => seed());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...seed(), ...(JSON.parse(raw) as Partial<AdminState>) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, loaded]);

  const update = useCallback((fn: (s: AdminState) => AdminState) => setState((s) => fn(s)), []);
  const resetDemo = useCallback(() => setState(seed()), []);
  const value = useMemo(() => ({ ...state, update, resetDemo }), [state, update, resetDemo]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminStoreProvider>");
  return ctx;
}

export function newId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
