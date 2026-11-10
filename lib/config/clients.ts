/**
 * Clients & collaborations configuration.
 *
 * Only add an organisation here once the relationship and logo usage are
 * approved. Until then, `showPlaceholders` renders labelled empty slots so the
 * layout can be reviewed without implying any real relationship.
 */

export type ClientCategory =
  | "Real Estate Developers"
  | "Financial Institutions"
  | "Academic & Research"
  | "Industry Bodies"
  | "Public Sector";

export interface ClientEntry {
  id: string;
  name: string;
  category: ClientCategory;
  /** path in /public/logos — only for approved logos */
  logo: string | null;
  /** short description of the collaboration (approved wording only) */
  note: string | null;
  approved: boolean;
}

export const clientsConfig = {
  /** Show labelled placeholder slots while approvals are pending. */
  showPlaceholders: true,
  placeholderSlotsPerCategory: 4,
  categories: [
    { id: "Real Estate Developers", blurb: "Developers using market intelligence for land, product and pricing decisions." },
    { id: "Financial Institutions", blurb: "Lenders and investors assessing residential market risk and opportunity." },
    { id: "Academic & Research", blurb: "Research collaborations with universities and policy institutes." },
    { id: "Industry Bodies", blurb: "Associations and forums engaging with housing market research." },
    { id: "Public Sector", blurb: "Public bodies drawing on market data for planning and policy." },
  ] as { id: ClientCategory; blurb: string }[],
  /** Approved entries go here. Intentionally empty in the showcase build. */
  entries: [] as ClientEntry[],
};
