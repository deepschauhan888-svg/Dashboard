import type {
  BhkConfiguration,
  Bracket,
  BracketPreset,
  PropertyType,
  PeriodRef,
} from "@/types/market";

/**
 * Analytical dimension definitions. These are configuration, not data:
 * brackets can be changed here (or, in future, from the admin console) and
 * every chart re-buckets automatically from each record's representative
 * ticket value / unit size.
 */

export const BHK_CONFIGURATIONS: BhkConfiguration[] = ["1BHK", "2BHK", "3BHK", "4BHK+"];

export const BHK_LABELS: Record<BhkConfiguration, string> = {
  "1BHK": "1 BHK",
  "2BHK": "2 BHK",
  "3BHK": "3 BHK",
  "4BHK+": "4 BHK +",
};

export const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: "apartment", label: "Apartment" },
  { id: "builder_floor", label: "Builder Floor" },
  { id: "villa", label: "Villa / Independent House" },
];

const L = 100_000; // 1 lakh
const CR = 10_000_000; // 1 crore

export const TICKET_PRESETS: BracketPreset[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Six brackets spanning affordable to luxury",
    brackets: [
      { id: "t_lt50l", label: "< ₹50 L", min: 0, max: 50 * L },
      { id: "t_50l_1cr", label: "₹50 L – 1 Cr", min: 50 * L, max: 1 * CR },
      { id: "t_1_2cr", label: "₹1 – 2 Cr", min: 1 * CR, max: 2 * CR },
      { id: "t_2_3cr", label: "₹2 – 3 Cr", min: 2 * CR, max: 3 * CR },
      { id: "t_3_5cr", label: "₹3 – 5 Cr", min: 3 * CR, max: 5 * CR },
      { id: "t_5cr_plus", label: "₹5 Cr +", min: 5 * CR, max: null },
    ],
  },
  {
    id: "affordable",
    label: "Affordable focus",
    description: "Finer resolution below ₹1.5 Cr",
    brackets: [
      { id: "a_lt30l", label: "< ₹30 L", min: 0, max: 30 * L },
      { id: "a_30_50l", label: "₹30 – 50 L", min: 30 * L, max: 50 * L },
      { id: "a_50_75l", label: "₹50 – 75 L", min: 50 * L, max: 75 * L },
      { id: "a_75l_1cr", label: "₹75 L – 1 Cr", min: 75 * L, max: 1 * CR },
      { id: "a_1_15cr", label: "₹1 – 1.5 Cr", min: 1 * CR, max: 1.5 * CR },
      { id: "a_15cr_plus", label: "₹1.5 Cr +", min: 1.5 * CR, max: null },
    ],
  },
  {
    id: "premium",
    label: "Premium focus",
    description: "Finer resolution above ₹1 Cr",
    brackets: [
      { id: "p_lt1cr", label: "< ₹1 Cr", min: 0, max: 1 * CR },
      { id: "p_1_2cr", label: "₹1 – 2 Cr", min: 1 * CR, max: 2 * CR },
      { id: "p_2_35cr", label: "₹2 – 3.5 Cr", min: 2 * CR, max: 3.5 * CR },
      { id: "p_35_5cr", label: "₹3.5 – 5 Cr", min: 3.5 * CR, max: 5 * CR },
      { id: "p_5_10cr", label: "₹5 – 10 Cr", min: 5 * CR, max: 10 * CR },
      { id: "p_10cr_plus", label: "₹10 Cr +", min: 10 * CR, max: null },
    ],
  },
];

export const SIZE_PRESETS: BracketPreset[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Six area brackets (sq ft, super built-up)",
    brackets: [
      { id: "s_lt600", label: "< 600", min: 0, max: 600 },
      { id: "s_600_1000", label: "600 – 1,000", min: 600, max: 1000 },
      { id: "s_1000_1500", label: "1,000 – 1,500", min: 1000, max: 1500 },
      { id: "s_1500_2000", label: "1,500 – 2,000", min: 1500, max: 2000 },
      { id: "s_2000_3000", label: "2,000 – 3,000", min: 2000, max: 3000 },
      { id: "s_3000_plus", label: "3,000 +", min: 3000, max: null },
    ],
  },
  {
    id: "compact",
    label: "Compact homes",
    description: "Finer resolution below 1,500 sq ft",
    brackets: [
      { id: "c_lt450", label: "< 450", min: 0, max: 450 },
      { id: "c_450_700", label: "450 – 700", min: 450, max: 700 },
      { id: "c_700_900", label: "700 – 900", min: 700, max: 900 },
      { id: "c_900_1200", label: "900 – 1,200", min: 900, max: 1200 },
      { id: "c_1200_1500", label: "1,200 – 1,500", min: 1200, max: 1500 },
      { id: "c_1500_plus", label: "1,500 +", min: 1500, max: null },
    ],
  },
  {
    id: "large",
    label: "Large formats",
    description: "Finer resolution above 1,500 sq ft",
    brackets: [
      { id: "l_lt1500", label: "< 1,500", min: 0, max: 1500 },
      { id: "l_1500_2000", label: "1,500 – 2,000", min: 1500, max: 2000 },
      { id: "l_2000_2500", label: "2,000 – 2,500", min: 2000, max: 2500 },
      { id: "l_2500_3500", label: "2,500 – 3,500", min: 2500, max: 3500 },
      { id: "l_3500_5000", label: "3,500 – 5,000", min: 3500, max: 5000 },
      { id: "l_5000_plus", label: "5,000 +", min: 5000, max: null },
    ],
  },
];

export const DEFAULT_TICKET_BRACKETS: Bracket[] = TICKET_PRESETS[0].brackets;
export const DEFAULT_SIZE_BRACKETS: Bracket[] = SIZE_PRESETS[0].brackets;

/** Coverage window of the demonstration dataset. */
export const DEMO_FIRST_PERIOD: PeriodRef = { year: 2022, quarter: 1 };
export const DEMO_LATEST_PERIOD: PeriodRef = { year: 2026, quarter: 3 };

export function bucketFor(value: number, brackets: Bracket[]): Bracket {
  for (const b of brackets) {
    if (value >= b.min && (b.max === null || value < b.max)) return b;
  }
  return brackets[brackets.length - 1];
}
