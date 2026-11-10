/** Parsing of user-defined bracket breakpoints (ticket ₹ lakh / size sq ft). */
import type { Bracket } from "@/types/market";

export type BracketDim = "ticket" | "size";
const MULTIPLIER: Record<BracketDim, number> = { ticket: 100_000, size: 1 };

export function formatBound(v: number, dim: BracketDim) {
  if (dim === "size") return v.toLocaleString("en-IN");
  if (v >= 10_000_000) return `₹${+(v / 10_000_000).toFixed(2)} Cr`;
  return `₹${+(v / 100_000).toFixed(1)} L`;
}

export function parseBreakpoints(text: string, dim: BracketDim): { brackets: Bracket[] | null; error: string | null } {
  const mult = MULTIPLIER[dim];
  const nums = text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (nums.some((n) => !Number.isFinite(n) || n <= 0)) return { brackets: null, error: "Use positive numbers only." };
  if (nums.length < 1 || nums.length > 8) return { brackets: null, error: "Enter between 1 and 8 breakpoints." };
  for (let i = 1; i < nums.length; i++) if (nums[i] <= nums[i - 1]) return { brackets: null, error: "Breakpoints must be in increasing order." };
  const bounds = nums.map((n) => n * mult);
  const brackets: Bracket[] = [];
  bounds.forEach((b, i) => {
    const min = i === 0 ? 0 : bounds[i - 1];
    brackets.push({ id: `c${i}`, label: i === 0 ? `< ${formatBound(b, dim)}` : `${formatBound(min, dim)} – ${formatBound(b, dim)}`, min, max: b });
  });
  brackets.push({ id: `c${bounds.length}`, label: `${formatBound(bounds[bounds.length - 1], dim)} +`, min: bounds[bounds.length - 1], max: null });
  return { brackets, error: null };
}

