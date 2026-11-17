/**
 * Site-wide configuration — the single source of truth for brand facts.
 * MB Research Intelligence is a login-first platform: the root URL is the
 * sign-in page, and there are no corporate content pages.
 */

export const siteConfig = {
  name: "MB Research Intelligence",
  parentBrand: "Magicbricks",
  tagline: "Understand Markets. Anticipate Demand. Make Better Decisions.",
  headline: "Real Estate Intelligence. Beyond the Obvious.",
  supportingText: "Access comprehensive real estate market intelligence and discover the insights that drive better business decisions.",
  description:
    "MB Research Intelligence gives subscribed real estate developers direct access to market intelligence on demand, supply, pricing and market dynamics.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * Official logo assets, used exactly as supplied (no recolouring, redrawing
   * or file edits). width/height are the files' intrinsic pixel sizes.
   * `mark` is the region of each file that contains the logo itself (the
   * supplied PNGs carry wide white margins); it is used only to frame the
   * image on screen. When higher-resolution or tightly-cropped originals
   * (or SVGs) are supplied, update src, width, height and set mark to the
   * full image: { x: 0, y: 0, w: width, h: height }.
   */
  logos: {
    mbResearch: { src: "/logos/mb-research.png", alt: "MB Research — Actionable Insights", width: 272, height: 162, mark: { x: 33, y: 50, w: 199, h: 62 } },
    magicbricks: { src: "/logos/magicbricks.png", alt: "Magicbricks — Pata Badlo, Life Badlo", width: 284, height: 142, mark: { x: 16, y: 29, w: 252, h: 84 } },
  },
} as const;
