/**
 * Clients & Collaborations — the ONLY place relationships are shown.
 *
 * Add an organisation only once the relationship AND the use of its name and
 * logo are approved. Nothing is invented: both lists ship empty.
 *
 * While `siteConfig.showSampleContent` is true, empty lists render labelled
 * logo slots so the layout can be reviewed; when false, they are hidden.
 */

export interface RelationshipEntry {
  id: string;
  name: string;
  /** path in /public/logos */
  logo: string | null;
  /** approved one-line description */
  note: string | null;
}

export const clientsConfig = {
  clients: {
    title: "Clients",
    intro: "Developers, lenders and advisers who use MB Research intelligence in their decisions.",
    segments: ["Real estate developers", "Financial institutions", "Advisory firms"],
    entries: [] as RelationshipEntry[],
    sampleSlots: 8,
  },
  collaborations: {
    title: "Research & Institutional Collaborations",
    intro: "Universities, policy institutes and industry bodies MB Research works with on housing-market research.",
    segments: ["Academic institutions", "Policy & research institutes", "Industry bodies"],
    entries: [] as RelationshipEntry[],
    sampleSlots: 4,
  },
};
