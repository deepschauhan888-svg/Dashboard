/** Number formatting helpers (Indian numbering conventions). */

const inFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return inFormatter.format(Math.round(n));
}

/** 12,345 → "12.3K"; 1,234,567 → "12.3 L" style compact for axes. */
export function formatCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(abs >= 1e8 ? 0 : 1)} Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(abs >= 1e6 ? 0 : 1)} L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}K`;
  return `${Math.round(n)}`;
}

export function formatPsf(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `₹${inFormatter.format(Math.round(n))}`;
}

export function formatInrCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return `₹${inFormatter.format(n)}`;
}

export function formatPct(n: number | null | undefined, digits = 1, signed = true): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const s = n.toFixed(digits);
  return `${signed && n > 0 ? "+" : ""}${s}%`;
}

export function formatPp(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(digits)} pp`;
}

export function formatRatio(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)}×`;
}

export function round(n: number, digits = 1) {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}
