/**
 * Market coverage shown on the public map.
 *
 * Status meanings:
 *  - "illustrative" : shown for demonstration; NOT a statement of live coverage
 *  - "live"         : confirmed coverage in the production platform
 *  - "planned"      : on the roadmap
 *
 * Every city ships as "illustrative" until coverage is confirmed.
 */
export type CoverageStatus = "illustrative" | "live" | "planned";

export interface CoverageCity {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  status: CoverageStatus;
  /** links to the demo dataset city id when demo metrics are available */
  demoCityId: string | null;
}

export const coverageConfig = {
  disclaimer:
    "Illustrative coverage for demonstration. Confirmed market coverage will be published with the production platform.",
  /**
   * The map outline is a simplified schematic for UI purposes only. Replace
   * `components/home/india-outline.ts` with an official Survey of India–compliant
   * boundary before public release.
   */
  outlineNote: "Schematic map — not to scale. Boundaries indicative only.",
  cities: [
    { id: "delhi", name: "New Delhi", region: "Delhi NCR", lat: 28.6139, lon: 77.209, status: "illustrative", demoCityId: "delhi" },
    { id: "noida", name: "Noida", region: "Delhi NCR", lat: 28.5355, lon: 77.391, status: "illustrative", demoCityId: "noida" },
    { id: "gurugram", name: "Gurugram", region: "Delhi NCR", lat: 28.4595, lon: 77.0266, status: "illustrative", demoCityId: "gurugram" },
    { id: "mumbai", name: "Mumbai", region: "MMR", lat: 19.076, lon: 72.8777, status: "illustrative", demoCityId: "mumbai" },
    { id: "pune", name: "Pune", region: "West", lat: 18.5204, lon: 73.8567, status: "illustrative", demoCityId: "pune" },
    { id: "ahmedabad", name: "Ahmedabad", region: "West", lat: 23.0225, lon: 72.5714, status: "illustrative", demoCityId: "ahmedabad" },
    { id: "bengaluru", name: "Bengaluru", region: "South", lat: 12.9716, lon: 77.5946, status: "illustrative", demoCityId: "bengaluru" },
    { id: "hyderabad", name: "Hyderabad", region: "South", lat: 17.385, lon: 78.4867, status: "illustrative", demoCityId: "hyderabad" },
    { id: "chennai", name: "Chennai", region: "South", lat: 13.0827, lon: 80.2707, status: "illustrative", demoCityId: "chennai" },
    { id: "kolkata", name: "Kolkata", region: "East", lat: 22.5726, lon: 88.3639, status: "illustrative", demoCityId: "kolkata" },
    { id: "jaipur", name: "Jaipur", region: "North", lat: 26.9124, lon: 75.7873, status: "planned", demoCityId: null },
    { id: "lucknow", name: "Lucknow", region: "North", lat: 26.8467, lon: 80.9462, status: "planned", demoCityId: null },
    { id: "kochi", name: "Kochi", region: "South", lat: 9.9312, lon: 76.2673, status: "planned", demoCityId: null },
    { id: "chandigarh", name: "Chandigarh", region: "North", lat: 30.7333, lon: 76.7794, status: "planned", demoCityId: null },
  ] as CoverageCity[],
};
