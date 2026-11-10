/**
 * About-page content. Narrative copy describes capabilities in general terms.
 * Quantitative facts are `null` until approved — they render as "TBC".
 */

export const aboutConfig = {
  intro:
    "MB Research is the research and analytics division of Magicbricks. It studies India's residential real estate markets — demand, supply, pricing and sentiment — and turns that understanding into research, indices and decision tools for the industry.",
  mission:
    "To give every real estate decision-maker a clearer, evidence-based view of the market — at the level of detail where decisions are actually made.",

  /** Approved headline figures. Leave null until confirmed. */
  facts: [
    { label: "Cities researched", value: null as string | null },
    { label: "Micromarkets tracked", value: null as string | null },
    { label: "Research publications", value: null as string | null },
    { label: "Years of market research", value: null as string | null },
  ],

  capabilities: [
    { title: "Research", body: "Structured studies of residential demand, supply, pricing and buyer behaviour across Indian cities." },
    { title: "Data Analytics", body: "Large-scale processing of market signals into consistent, comparable indicators." },
    { title: "Market Intelligence", body: "City and micromarket insight designed for developer, lender and investor decisions." },
    { title: "Valuation Expertise", body: "Analytical support for price positioning and valuation of residential assets." },
    { title: "Research Publications", body: "Periodic indices, reports and special studies that inform the wider industry." },
    { title: "Institutional Collaborations", body: "Research partnerships with institutions, industry bodies and academia." },
  ],

  methodology: [
    { step: "Collect", body: "Market signals are gathered continuously from the platform and complementary sources." },
    { step: "Validate", body: "Records are de-duplicated, outlier-checked and mapped to standard geographies and definitions." },
    { step: "Structure", body: "Data is organised by city, micromarket, configuration, ticket size and unit size for every quarter." },
    { step: "Analyse", body: "Analysts compute indicators, test movements for significance and interpret what changed and why." },
    { step: "Publish", body: "Findings are released as dashboards, indices and reports, with versioned datasets for traceability." },
  ],

  principles: [
    { title: "Consistency", body: "One data model and one set of definitions across every chart and report." },
    { title: "Granularity", body: "Analysis at locality and configuration level, where decisions are made." },
    { title: "Transparency", body: "Clear units, clear periods and clear labelling of what each number measures." },
    { title: "Independence", body: "Research conclusions follow the data." },
  ],
};
