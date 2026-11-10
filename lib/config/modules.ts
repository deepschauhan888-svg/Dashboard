/** Product module catalogue — shared by the home page, platform page and dashboards. */

export interface IntelligenceArea {
  id: string;
  code: string;
  title: string;
  description: string;
  analystHref: string;
}

export const intelligenceAreas: IntelligenceArea[] = [
  {
    id: "demand",
    code: "01",
    title: "Demand Intelligence",
    description: "Track how buyer demand moves across cities, micromarkets, configurations and budgets — quarter by quarter.",
    analystHref: "/dashboard/analyst/demand",
  },
  {
    id: "supply",
    code: "02",
    title: "Supply Intelligence",
    description: "See where new supply is entering the market, at what price points and in which formats.",
    analystHref: "/dashboard/analyst/supply",
  },
  {
    id: "price",
    code: "03",
    title: "Price Intelligence",
    description: "Follow price trajectories and appreciation by locality and configuration, not just city averages.",
    analystHref: "/dashboard/analyst/price",
  },
  {
    id: "configuration",
    code: "04",
    title: "Configuration Intelligence",
    description: "Compare 1, 2, 3 and 4+ BHK demand against supply to find the formats the market is short of.",
    analystHref: "/dashboard/analyst/configuration",
  },
  {
    id: "ticket",
    code: "05",
    title: "Ticket Size Intelligence",
    description: "Understand which budget brackets buyers are searching in — and where supply is mispriced.",
    analystHref: "/dashboard/analyst/ticket-size",
  },
  {
    id: "micromarket",
    code: "06",
    title: "Micromarket Intelligence",
    description: "Go below the city to locality level, and compare micromarkets side by side on every indicator.",
    analystHref: "/dashboard/analyst/micromarkets",
  },
];
