/**
 * Front-end dataset validation used by the admin upload workflow.
 * The production validation engine will run server-side with the same rules
 * (and more), but keeping the rules here lets the showcase demonstrate them.
 */
import type { MarketCatalog, MarketRecord } from "@/types/market";
import { BHK_CONFIGURATIONS, PROPERTY_TYPES } from "@/lib/config/dimensions";
import { parseCsv, toCsv } from "@/lib/utils/download";

export const DATASET_TYPES = [
  { id: "market_facts", label: "Market facts (demand, supply, price, inventory)" },
  { id: "micromarket_master", label: "Micromarket master" },
  { id: "price_index", label: "Price index series" },
] as const;
export type DatasetType = (typeof DATASET_TYPES)[number]["id"];

export const REQUIRED_COLUMNS = [
  "city_id",
  "micromarket_id",
  "reporting_year",
  "reporting_quarter",
  "property_type",
  "bhk_configuration",
  "unit_size_sqft",
  "demand",
  "supply",
  "average_price",
  "inventory",
] as const;

export type Severity = "error" | "warning";

export interface ValidationIssue {
  row: number; // 1-based data row (excluding header); 0 = file-level
  column: string;
  message: string;
  severity: Severity;
}

export interface ValidationCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface ValidationReport {
  fileName: string;
  datasetType: DatasetType;
  period: { year: number; quarter: number };
  cityId: string | "all";
  rowCount: number;
  columns: string[];
  preview: string[][];
  issues: ValidationIssue[];
  checks: ValidationCheck[];
  totals: { demand: number; supply: number; inventory: number };
  validatedAt: string;
  publishable: boolean;
}

export function validateDataset(
  text: string,
  opts: { fileName: string; datasetType: DatasetType; year: number; quarter: number; cityId: string | "all"; catalog: MarketCatalog },
): ValidationReport {
  const rows = parseCsv(text);
  const issues: ValidationIssue[] = [];
  const header = (rows[0] ?? []).map((h) => h.trim().toLowerCase());
  const data = rows.slice(1);
  const col = (name: string) => header.indexOf(name);

  const missing = REQUIRED_COLUMNS.filter((c) => col(c) === -1);
  missing.forEach((c) => issues.push({ row: 0, column: c, message: `Required column "${c}" is missing`, severity: "error" }));

  const cityIds = new Set(opts.catalog.cities.map((c) => c.city_id));
  const mmToCity = new Map<string, string>();
  opts.catalog.cities.forEach((c) => c.micromarkets.forEach((m) => mmToCity.set(m.micromarket_id, c.city_id)));
  const ptypes = new Set<string>(PROPERTY_TYPES.map((p) => p.id));
  const bhks = new Set<string>(BHK_CONFIGURATIONS);
  const seen = new Map<string, number>();
  let demand = 0;
  let supply = 0;
  let inventory = 0;
  let periodMismatch = 0;
  let cityMismatch = 0;

  if (!missing.length) {
    data.forEach((r, i) => {
      const rowNo = i + 1;
      const get = (c: string) => (r[col(c)] ?? "").trim();
      const num = (c: string, opt: { min?: number; max?: number; int?: boolean } = {}) => {
        const raw = get(c);
        const v = Number(raw);
        if (raw === "" || !Number.isFinite(v)) {
          issues.push({ row: rowNo, column: c, message: `"${raw}" is not a number`, severity: "error" });
          return null;
        }
        if (opt.int && !Number.isInteger(v)) issues.push({ row: rowNo, column: c, message: "Must be a whole number", severity: "error" });
        if (opt.min !== undefined && v < opt.min) issues.push({ row: rowNo, column: c, message: `Must be ≥ ${opt.min}`, severity: "error" });
        if (opt.max !== undefined && v > opt.max) issues.push({ row: rowNo, column: c, message: `Unusually high value (${v})`, severity: "warning" });
        return v;
      };

      const city = get("city_id");
      const mm = get("micromarket_id");
      if (!cityIds.has(city)) issues.push({ row: rowNo, column: "city_id", message: `Unknown city "${city}"`, severity: "error" });
      if (!mmToCity.has(mm)) issues.push({ row: rowNo, column: "micromarket_id", message: `Unknown micromarket "${mm}"`, severity: "error" });
      else if (mmToCity.get(mm) !== city) issues.push({ row: rowNo, column: "micromarket_id", message: `Micromarket "${mm}" does not belong to "${city}"`, severity: "error" });
      if (opts.cityId !== "all" && city !== opts.cityId) cityMismatch++;

      const y = num("reporting_year", { int: true });
      const q = num("reporting_quarter", { int: true, min: 1 });
      if (q !== null && q > 4) issues.push({ row: rowNo, column: "reporting_quarter", message: "Quarter must be 1–4", severity: "error" });
      if (y !== null && q !== null && (y !== opts.year || q !== opts.quarter)) periodMismatch++;

      if (!ptypes.has(get("property_type"))) issues.push({ row: rowNo, column: "property_type", message: `Invalid property type "${get("property_type")}"`, severity: "error" });
      if (!bhks.has(get("bhk_configuration"))) issues.push({ row: rowNo, column: "bhk_configuration", message: `Invalid configuration "${get("bhk_configuration")}"`, severity: "error" });

      num("unit_size_sqft", { min: 150, max: 15000 });
      const d = num("demand", { min: 0, int: true, max: 100000 });
      const s = num("supply", { min: 0, int: true, max: 100000 });
      const p = num("average_price", { min: 500, max: 150000 });
      const inv = num("inventory", { min: 0, int: true, max: 500000 });
      if (p !== null && p > 0 && p < 1500) issues.push({ row: rowNo, column: "average_price", message: "Price per sq ft looks implausibly low", severity: "warning" });
      if (d !== null) demand += d;
      if (s !== null) supply += s;
      if (inv !== null) inventory += inv;

      const keyStr = [city, mm, get("reporting_year"), get("reporting_quarter"), get("property_type"), get("bhk_configuration"), get("unit_size_sqft")].join("|");
      if (seen.has(keyStr)) issues.push({ row: rowNo, column: "*", message: `Duplicate of row ${seen.get(keyStr)}`, severity: "error" });
      else seen.set(keyStr, rowNo);
    });
  }

  if (periodMismatch) issues.push({ row: 0, column: "reporting_year/quarter", message: `${periodMismatch} row(s) do not match the selected reporting period Q${opts.quarter} ${opts.year}`, severity: "error" });
  if (cityMismatch) issues.push({ row: 0, column: "city_id", message: `${cityMismatch} row(s) belong to a different city than the one selected`, severity: "error" });

  const errorsIn = (pred: (i: ValidationIssue) => boolean) => issues.filter((i) => i.severity === "error" && pred(i)).length;
  const warnsIn = (pred: (i: ValidationIssue) => boolean) => issues.filter((i) => i.severity === "warning" && pred(i)).length;
  const check = (id: string, label: string, pred: (i: ValidationIssue) => boolean, okText: string): ValidationCheck => {
    const e = errorsIn(pred);
    const w = warnsIn(pred);
    return { id, label, status: e ? "fail" : w ? "warn" : "pass", detail: e ? `${e} error(s)` : w ? `${w} warning(s)` : okText };
  };

  const checks: ValidationCheck[] = [
    { id: "schema", label: "Schema & required columns", status: missing.length ? "fail" : "pass", detail: missing.length ? `Missing: ${missing.join(", ")}` : `${header.length} columns recognised` },
    { id: "rows", label: "Row count", status: data.length ? "pass" : "fail", detail: data.length ? `${data.length.toLocaleString("en-IN")} data rows` : "File has no data rows" },
    check("geo", "Geography mapping", (i) => i.column === "city_id" || i.column === "micromarket_id", "All cities and micromarkets recognised"),
    check("period", "Reporting period", (i) => i.column.startsWith("reporting"), `All rows in Q${opts.quarter} ${opts.year}`),
    check("dims", "Dimension values", (i) => i.column === "property_type" || i.column === "bhk_configuration", "Property types and configurations valid"),
    check("measures", "Measures & ranges", (i) => ["demand", "supply", "average_price", "inventory", "unit_size_sqft"].includes(i.column), "All measures numeric and in range"),
    check("dupes", "Duplicate records", (i) => i.column === "*", "No duplicate keys"),
  ];

  const hasErrors = issues.some((i) => i.severity === "error");
  return {
    fileName: opts.fileName,
    datasetType: opts.datasetType,
    period: { year: opts.year, quarter: opts.quarter },
    cityId: opts.cityId,
    rowCount: data.length,
    columns: header,
    preview: data.slice(0, 12),
    issues: issues.slice(0, 500),
    checks,
    totals: { demand, supply, inventory },
    validatedAt: new Date().toISOString(),
    publishable: !hasErrors && data.length > 0,
  };
}

/** Builds a template CSV from demo records for the chosen period/city. */
export function buildTemplateCsv(records: MarketRecord[], year: number, quarter: number, cityId: string | "all", withErrors = false): string {
  const rows = records
    .filter((r) => r.reporting_year === year && r.reporting_quarter === quarter && (cityId === "all" || r.city_id === cityId))
    .slice(0, 60)
    .map((r) => [r.city_id, r.micromarket_id, r.reporting_year, r.reporting_quarter, r.property_type, r.bhk_configuration, r.unit_size_sqft, r.demand, r.supply, r.average_price, r.inventory]);
  if (withErrors && rows.length > 6) {
    rows[2][7] = "n/a"; // non-numeric demand
    rows[4][1] = "unknown-locality"; // unknown micromarket
    rows[5][5] = "5BHK"; // invalid configuration
    rows[6][9] = 900; // implausible price (warning)
    rows.push([...rows[0]]); // duplicate
  }
  return toCsv([...REQUIRED_COLUMNS], rows);
}
