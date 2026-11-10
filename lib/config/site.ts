/**
 * Site-wide configuration — the single source of truth for business facts.
 *
 * Every fact that has not been formally approved is `null`. Public pages
 * render ONLY configured values: an unset email simply does not appear.
 *
 * `showSampleContent` controls clearly-labelled sample entries (publications)
 * used to demonstrate layouts during the management review. Set it to false
 * before public launch — sample entries then disappear entirely.
 */

export const siteConfig = {
  name: "MB Research Intelligence",
  shortName: "MB Research",
  parentBrand: "Magicbricks",
  tagline: "Understand Markets. Anticipate Demand. Make Better Decisions.",
  description:
    "MB Research Intelligence transforms real estate market data into meaningful intelligence through comprehensive analysis of demand, supply, pricing and market dynamics.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  showSampleContent: true,

  contact: {
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
    hours: null as string | null,
  },

  social: {
    linkedin: null as string | null,
    x: null as string | null,
    youtube: null as string | null,
  },

  /**
   * Approved photography. Place files in /public/images and set the paths.
   * Until then, pages use an architectural line illustration.
   */
  imagery: {
    hero: null as string | null,
    platform: null as string | null,
    about: null as string | null,
  },
} as const;

export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "About MB Research", href: "/about" },
  { label: "Publications", href: "/publications" },
  { label: "Clients & Collaborations", href: "/clients" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalNav = [
  { label: "Data Disclaimer", href: "/legal/disclaimer" },
  { label: "Privacy", href: "/legal/privacy" },
] as const;
