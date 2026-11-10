/**
 * About-page content — institutional credibility only. Platform features are
 * described exclusively on the Platform page; collaborations exclusively on the
 * Clients & Collaborations page.
 *
 * Quantitative facts are `null` until approved; unset facts are not displayed.
 */

export const aboutConfig = {
  intro:
    "MB Research is the research and analytics division of Magicbricks. It studies India's residential real estate markets — how buyers search, what is being built, and how prices respond — and publishes that understanding for the industry.",

  philosophy: {
    statement: "Good decisions need the market measured consistently, at the level where decisions are made.",
    principles: [
      { title: "Consistency", body: "One set of definitions, applied to every city and every quarter, so that comparisons hold." },
      { title: "Granularity", body: "Analysis at locality, configuration and budget level — not only city averages." },
      { title: "Transparency", body: "Every figure states what it measures, its unit and the period it covers." },
      { title: "Independence", body: "Conclusions follow the evidence, whatever the evidence shows." },
    ],
  },

  methodology: [
    { step: "Collect", body: "Market signals are gathered continuously and mapped to standard geographies." },
    { step: "Validate", body: "Records are de-duplicated, outlier-checked and reconciled against reference data." },
    { step: "Structure", body: "Data is organised by city, micromarket, configuration, ticket size, unit size and quarter." },
    { step: "Analyse", body: "Analysts compute indicators, test movements for significance and interpret what changed." },
    { step: "Publish", body: "Findings are released as reports, indices and versioned datasets with a full audit trail." },
  ],

  capabilities: [
    { title: "Market research", body: "Structured studies of residential demand, supply, pricing and buyer behaviour." },
    { title: "Data analytics", body: "Large-scale processing of market signals into comparable, quality-controlled indicators." },
    { title: "Index construction", body: "Design and maintenance of periodic price and sentiment indices." },
    { title: "Valuation support", body: "Analytical input for price positioning and residential asset valuation." },
  ],

  expertise: [
    "Residential sales markets",
    "Rental markets and yields",
    "Buyer and seller sentiment",
    "Price index methodology",
    "Locality and catchment research",
    "Housing supply pipelines",
  ],

  background:
    "MB Research works within Magicbricks, giving its analysts a continuous view of residential market activity across Indian cities and the context to interpret it.",

  /** Approved headline figures. Leave null until confirmed — null facts are hidden. */
  facts: [
    { label: "Cities researched", value: null as string | null },
    { label: "Micromarkets tracked", value: null as string | null },
    { label: "Research publications", value: null as string | null },
    { label: "Years of market research", value: null as string | null },
  ],
};
