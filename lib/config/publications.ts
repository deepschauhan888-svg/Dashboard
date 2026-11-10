/**
 * Publication library configuration.
 *
 * IMPORTANT: The entries below are SAMPLE PLACEHOLDERS that demonstrate the
 * library layout. They are not real reports and contain no findings. Replace
 * each entry with an approved publication (title, date, summary) and set
 * `externalUrl` / `pdfUrl` to the original source. Set `isPlaceholder: false`
 * once an entry is real — the "Sample entry" label then disappears.
 */
import { siteConfig } from "./site";

export type PublicationCategory =
  | "PropIndex"
  | "Housing Market Reports"
  | "Rental Market Reports"
  | "Micromarket Reports"
  | "Special Research Reports"
  | "Housing Sentiment Index";

export interface Publication {
  slug: string;
  title: string;
  category: PublicationCategory;
  /** ISO date */
  date: string;
  summary: string;
  /** What the report covers — scope, not findings */
  scope: string[];
  /** Cover artwork variant */
  cover: "grid" | "bars" | "rings" | "contour" | "columns" | "wave";
  /** Optional cover image in /public/publications */
  coverImage: string | null;
  externalUrl: string | null;
  pdfUrl: string | null;
  isPlaceholder: boolean;
}

export const PUBLICATION_CATEGORIES: { id: PublicationCategory; description: string }[] = [
  { id: "PropIndex", description: "Periodic tracking of residential price and supply movements across major cities." },
  { id: "Housing Market Reports", description: "In-depth studies of residential demand, supply and buyer behaviour." },
  { id: "Rental Market Reports", description: "Rental values, yields and tenant demand across urban markets." },
  { id: "Micromarket Reports", description: "Locality-level analysis for developers evaluating specific catchments." },
  { id: "Housing Sentiment Index", description: "Measurement of buyer and seller sentiment towards the housing market." },
  { id: "Special Research Reports", description: "Thematic research on policy, infrastructure and emerging segments." },
];

export const publications: Publication[] = [
  {
    slug: "propindex-sample-edition-a",
    title: "PropIndex — Quarterly Edition",
    category: "PropIndex",
    date: "2026-10-20",
    summary: "Sample entry illustrating how a PropIndex edition will appear in the library. Replace with the approved edition title, summary and link.",
    scope: ["City-level residential price movement", "Quarterly supply and demand indicators", "Configuration-wise trends"],
    cover: "bars",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "propindex-sample-edition-b",
    title: "PropIndex — Previous Quarterly Edition",
    category: "PropIndex",
    date: "2026-07-18",
    summary: "Sample entry for an earlier PropIndex edition. Demonstrates chronological ordering and filtering.",
    scope: ["City-level residential price movement", "Quarter-on-quarter comparisons"],
    cover: "bars",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "housing-market-outlook-sample",
    title: "Residential Market Outlook",
    category: "Housing Market Reports",
    date: "2026-09-05",
    summary: "Sample entry for a long-form housing market study covering demand drivers, supply pipeline and pricing dynamics.",
    scope: ["Demand drivers by city", "Supply pipeline assessment", "Pricing dynamics"],
    cover: "grid",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "buyer-preferences-study-sample",
    title: "Homebuyer Preferences Study",
    category: "Housing Market Reports",
    date: "2026-04-12",
    summary: "Sample entry for a study of configuration, budget and amenity preferences among prospective homebuyers.",
    scope: ["Configuration preferences", "Budget brackets", "Amenity priorities"],
    cover: "columns",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "rental-market-review-sample",
    title: "Urban Rental Market Review",
    category: "Rental Market Reports",
    date: "2026-08-22",
    summary: "Sample entry for rental market research covering rental values, yields and tenant demand across major cities.",
    scope: ["Rental value trends", "Gross rental yields", "Tenant demand patterns"],
    cover: "wave",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "rental-yield-tracker-sample",
    title: "Rental Yield Tracker",
    category: "Rental Market Reports",
    date: "2026-02-28",
    summary: "Sample entry for a periodic tracker of rental yields by city and configuration.",
    scope: ["Yield by configuration", "City comparisons"],
    cover: "wave",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "micromarket-profile-sample-west",
    title: "Micromarket Profile — Western Corridor",
    category: "Micromarket Reports",
    date: "2026-06-30",
    summary: "Sample entry for a locality-level profile of the kind developers commission when evaluating a catchment.",
    scope: ["Locality demand and supply", "Ticket-size distribution", "Competitive project landscape"],
    cover: "contour",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "micromarket-profile-sample-south",
    title: "Micromarket Profile — Southern Growth Belt",
    category: "Micromarket Reports",
    date: "2026-03-15",
    summary: "Sample entry for a second micromarket profile, demonstrating category grouping.",
    scope: ["Infrastructure catalysts", "Configuration mix", "Price positioning"],
    cover: "contour",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "infrastructure-impact-sample",
    title: "Infrastructure and Housing Demand",
    category: "Special Research Reports",
    date: "2026-05-20",
    summary: "Sample entry for thematic research on how transport and infrastructure projects shape residential demand.",
    scope: ["Transit corridors", "Before/after demand analysis", "Price response"],
    cover: "rings",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "luxury-segment-sample",
    title: "The Premium Housing Segment",
    category: "Special Research Reports",
    date: "2025-12-10",
    summary: "Sample entry for a special report on the premium and luxury housing segment.",
    scope: ["Premium supply pipeline", "Buyer profile", "Ticket-size evolution"],
    cover: "rings",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "sentiment-index-sample-a",
    title: "Housing Sentiment Index — Latest Round",
    category: "Housing Sentiment Index",
    date: "2026-09-25",
    summary: "Sample entry for the sentiment index, measuring buyer and seller outlook towards the housing market.",
    scope: ["Buyer sentiment", "Seller sentiment", "City-wise sentiment scores"],
    cover: "grid",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
  {
    slug: "sentiment-index-sample-b",
    title: "Housing Sentiment Index — Previous Round",
    category: "Housing Sentiment Index",
    date: "2026-03-28",
    summary: "Sample entry for an earlier sentiment index round.",
    scope: ["Buyer sentiment", "Seller sentiment"],
    cover: "grid",
    coverImage: null,
    externalUrl: null,
    pdfUrl: null,
    isPlaceholder: true,
  },
];

/** Publications visible on the site. Sample entries appear only while siteConfig.showSampleContent is true. */
export function visiblePublications(): Publication[] {
  return publications.filter((p) => !p.isPlaceholder || siteConfig.showSampleContent).sort((a, b) => b.date.localeCompare(a.date));
}

export function getPublication(slug: string) {
  return visiblePublications().find((p) => p.slug === slug) ?? null;
}
