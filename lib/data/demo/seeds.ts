/**
 * DEMONSTRATION DATA SEEDS — NOT MAGICBRICKS MARKET STATISTICS.
 *
 * City and micromarket names are real geographies so the showcase reads
 * naturally, but every number below is a synthetic generator parameter chosen
 * to produce plausible-looking, internally consistent demonstration data.
 * Nothing here represents actual demand, supply, prices or inventory.
 */

export interface MicromarketSeed {
  id: string;
  name: string;
  /** starting ₹/sq ft in the first demo quarter */
  psf: number;
  /** annual price growth (fraction) */
  priceGrowth: number;
  /** demand units per quarter at start */
  demand: number;
  /** annual demand growth (fraction, can be negative) */
  demandGrowth: number;
  /** supply units per quarter at start */
  supply: number;
  /** annual supply growth (fraction) */
  supplyGrowth: number;
  /** 0 = mass/affordable, 1 = premium — skews configuration mix */
  affluence: number;
}

export interface CitySeed {
  id: string;
  name: string;
  state: string;
  region: string;
  lat: number;
  lon: number;
  /** multiplier on typical unit sizes (compact metros < 1) */
  sizeFactor: number;
  /** property-type shares of volume */
  propertyMix: { apartment: number; builder_floor: number; villa: number };
  micromarkets: MicromarketSeed[];
}

export const CITY_SEEDS: CitySeed[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    region: "West",
    lat: 19.076,
    lon: 72.8777,
    sizeFactor: 0.72,
    propertyMix: { apartment: 1, builder_floor: 0, villa: 0 },
    micromarkets: [
      { id: "mum-andheri-w", name: "Andheri West", psf: 27500, priceGrowth: 0.06, demand: 3400, demandGrowth: 0.04, supply: 3000, supplyGrowth: 0.03, affluence: 0.7 },
      { id: "mum-powai", name: "Powai", psf: 24800, priceGrowth: 0.075, demand: 2900, demandGrowth: 0.07, supply: 2700, supplyGrowth: 0.035, affluence: 0.75 },
      { id: "mum-chembur", name: "Chembur", psf: 21500, priceGrowth: 0.068, demand: 2500, demandGrowth: 0.055, supply: 2600, supplyGrowth: 0.06, affluence: 0.55 },
      { id: "mum-thane-w", name: "Thane West", psf: 13800, priceGrowth: 0.085, demand: 4800, demandGrowth: 0.08, supply: 4300, supplyGrowth: 0.05, affluence: 0.35 },
      { id: "mum-kharghar", name: "Kharghar (Navi Mumbai)", psf: 11200, priceGrowth: 0.07, demand: 3900, demandGrowth: 0.06, supply: 4200, supplyGrowth: 0.07, affluence: 0.3 },
    ],
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    region: "South",
    lat: 12.9716,
    lon: 77.5946,
    sizeFactor: 1.05,
    propertyMix: { apartment: 0.86, builder_floor: 0, villa: 0.14 },
    micromarkets: [
      { id: "blr-whitefield", name: "Whitefield", psf: 7400, priceGrowth: 0.105, demand: 4600, demandGrowth: 0.08, supply: 4400, supplyGrowth: 0.05, affluence: 0.55 },
      { id: "blr-sarjapur", name: "Sarjapur Road", psf: 7000, priceGrowth: 0.11, demand: 4300, demandGrowth: 0.1, supply: 4500, supplyGrowth: 0.06, affluence: 0.5 },
      { id: "blr-hebbal", name: "Hebbal", psf: 9800, priceGrowth: 0.09, demand: 2600, demandGrowth: 0.06, supply: 2300, supplyGrowth: 0.045, affluence: 0.8 },
      { id: "blr-ecity", name: "Electronic City", psf: 5200, priceGrowth: 0.075, demand: 3800, demandGrowth: 0.03, supply: 4100, supplyGrowth: 0.06, affluence: 0.25 },
      { id: "blr-yelahanka", name: "Yelahanka", psf: 6100, priceGrowth: 0.095, demand: 2900, demandGrowth: 0.085, supply: 2600, supplyGrowth: 0.07, affluence: 0.45 },
    ],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    region: "South",
    lat: 17.385,
    lon: 78.4867,
    sizeFactor: 1.15,
    propertyMix: { apartment: 0.84, builder_floor: 0, villa: 0.16 },
    micromarkets: [
      { id: "hyd-gachibowli", name: "Gachibowli", psf: 8600, priceGrowth: 0.09, demand: 3700, demandGrowth: 0.06, supply: 3500, supplyGrowth: 0.06, affluence: 0.7 },
      { id: "hyd-kondapur", name: "Kondapur", psf: 7800, priceGrowth: 0.085, demand: 3300, demandGrowth: 0.05, supply: 3400, supplyGrowth: 0.065, affluence: 0.6 },
      { id: "hyd-kokapet", name: "Kokapet", psf: 9400, priceGrowth: 0.12, demand: 2400, demandGrowth: 0.12, supply: 2700, supplyGrowth: 0.13, affluence: 0.9 },
      { id: "hyd-kukatpally", name: "Kukatpally", psf: 6200, priceGrowth: 0.07, demand: 3900, demandGrowth: 0.04, supply: 3600, supplyGrowth: 0.03, affluence: 0.35 },
      { id: "hyd-miyapur", name: "Miyapur", psf: 5400, priceGrowth: 0.075, demand: 3500, demandGrowth: 0.07, supply: 3200, supplyGrowth: 0.05, affluence: 0.3 },
    ],
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    region: "West",
    lat: 18.5204,
    lon: 73.8567,
    sizeFactor: 0.9,
    propertyMix: { apartment: 0.95, builder_floor: 0, villa: 0.05 },
    micromarkets: [
      { id: "pun-hinjewadi", name: "Hinjewadi", psf: 6700, priceGrowth: 0.07, demand: 4200, demandGrowth: 0.06, supply: 4300, supplyGrowth: 0.07, affluence: 0.4 },
      { id: "pun-wakad", name: "Wakad", psf: 7300, priceGrowth: 0.08, demand: 3600, demandGrowth: 0.07, supply: 3300, supplyGrowth: 0.05, affluence: 0.45 },
      { id: "pun-kharadi", name: "Kharadi", psf: 8200, priceGrowth: 0.085, demand: 3300, demandGrowth: 0.075, supply: 3000, supplyGrowth: 0.045, affluence: 0.6 },
      { id: "pun-baner", name: "Baner", psf: 9100, priceGrowth: 0.075, demand: 2600, demandGrowth: 0.05, supply: 2500, supplyGrowth: 0.05, affluence: 0.75 },
      { id: "pun-hadapsar", name: "Hadapsar", psf: 6100, priceGrowth: 0.065, demand: 3500, demandGrowth: 0.045, supply: 3700, supplyGrowth: 0.06, affluence: 0.3 },
    ],
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    region: "South",
    lat: 13.0827,
    lon: 80.2707,
    sizeFactor: 1.0,
    propertyMix: { apartment: 0.9, builder_floor: 0, villa: 0.1 },
    micromarkets: [
      { id: "che-omr", name: "OMR", psf: 6000, priceGrowth: 0.07, demand: 3800, demandGrowth: 0.06, supply: 3900, supplyGrowth: 0.06, affluence: 0.45 },
      { id: "che-velachery", name: "Velachery", psf: 8200, priceGrowth: 0.06, demand: 2800, demandGrowth: 0.04, supply: 2500, supplyGrowth: 0.03, affluence: 0.55 },
      { id: "che-porur", name: "Porur", psf: 6600, priceGrowth: 0.065, demand: 2900, demandGrowth: 0.055, supply: 2800, supplyGrowth: 0.05, affluence: 0.4 },
      { id: "che-anna-nagar", name: "Anna Nagar", psf: 13500, priceGrowth: 0.055, demand: 1900, demandGrowth: 0.035, supply: 1600, supplyGrowth: 0.02, affluence: 0.85 },
      { id: "che-pallavaram", name: "Pallavaram", psf: 5400, priceGrowth: 0.06, demand: 2700, demandGrowth: 0.05, supply: 2900, supplyGrowth: 0.065, affluence: 0.25 },
    ],
  },
  {
    id: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    region: "East",
    lat: 22.5726,
    lon: 88.3639,
    sizeFactor: 0.92,
    propertyMix: { apartment: 0.97, builder_floor: 0, villa: 0.03 },
    micromarkets: [
      { id: "kol-new-town", name: "New Town", psf: 5300, priceGrowth: 0.06, demand: 3100, demandGrowth: 0.05, supply: 3200, supplyGrowth: 0.055, affluence: 0.45 },
      { id: "kol-rajarhat", name: "Rajarhat", psf: 4800, priceGrowth: 0.055, demand: 2800, demandGrowth: 0.045, supply: 3000, supplyGrowth: 0.05, affluence: 0.35 },
      { id: "kol-em-bypass", name: "EM Bypass", psf: 7600, priceGrowth: 0.05, demand: 2300, demandGrowth: 0.035, supply: 2100, supplyGrowth: 0.03, affluence: 0.7 },
      { id: "kol-behala", name: "Behala", psf: 4400, priceGrowth: 0.045, demand: 2400, demandGrowth: 0.03, supply: 2300, supplyGrowth: 0.03, affluence: 0.2 },
      { id: "kol-tollygunge", name: "Tollygunge", psf: 6300, priceGrowth: 0.05, demand: 2000, demandGrowth: 0.04, supply: 1800, supplyGrowth: 0.025, affluence: 0.55 },
    ],
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    region: "West",
    lat: 23.0225,
    lon: 72.5714,
    sizeFactor: 1.1,
    propertyMix: { apartment: 0.86, builder_floor: 0, villa: 0.14 },
    micromarkets: [
      { id: "amd-sg-highway", name: "SG Highway", psf: 6400, priceGrowth: 0.08, demand: 2900, demandGrowth: 0.07, supply: 2700, supplyGrowth: 0.06, affluence: 0.7 },
      { id: "amd-shela", name: "Shela", psf: 4700, priceGrowth: 0.085, demand: 2700, demandGrowth: 0.09, supply: 2900, supplyGrowth: 0.08, affluence: 0.45 },
      { id: "amd-gota", name: "Gota", psf: 4500, priceGrowth: 0.07, demand: 2500, demandGrowth: 0.05, supply: 2400, supplyGrowth: 0.05, affluence: 0.35 },
      { id: "amd-bopal", name: "Bopal", psf: 5000, priceGrowth: 0.075, demand: 2600, demandGrowth: 0.06, supply: 2500, supplyGrowth: 0.055, affluence: 0.45 },
      { id: "amd-chandkheda", name: "Chandkheda", psf: 3900, priceGrowth: 0.06, demand: 2300, demandGrowth: 0.04, supply: 2400, supplyGrowth: 0.045, affluence: 0.2 },
    ],
  },
  {
    id: "delhi",
    name: "New Delhi",
    state: "Delhi",
    region: "North · Delhi NCR",
    lat: 28.6139,
    lon: 77.209,
    sizeFactor: 1.15,
    propertyMix: { apartment: 0.45, builder_floor: 0.5, villa: 0.05 },
    micromarkets: [
      { id: "del-dwarka", name: "Dwarka", psf: 11800, priceGrowth: 0.065, demand: 2900, demandGrowth: 0.05, supply: 2500, supplyGrowth: 0.03, affluence: 0.5 },
      { id: "del-rohini", name: "Rohini", psf: 10200, priceGrowth: 0.055, demand: 2600, demandGrowth: 0.035, supply: 2400, supplyGrowth: 0.03, affluence: 0.4 },
      { id: "del-vasant-kunj", name: "Vasant Kunj", psf: 21500, priceGrowth: 0.06, demand: 1400, demandGrowth: 0.04, supply: 1200, supplyGrowth: 0.02, affluence: 0.9 },
      { id: "del-saket", name: "Saket", psf: 24500, priceGrowth: 0.055, demand: 1200, demandGrowth: 0.03, supply: 1100, supplyGrowth: 0.02, affluence: 0.95 },
      { id: "del-mayur-vihar", name: "Mayur Vihar", psf: 12200, priceGrowth: 0.05, demand: 2100, demandGrowth: 0.03, supply: 1900, supplyGrowth: 0.025, affluence: 0.45 },
    ],
  },
  {
    id: "noida",
    name: "Noida",
    state: "Uttar Pradesh",
    region: "North · Delhi NCR",
    lat: 28.5355,
    lon: 77.391,
    sizeFactor: 1.1,
    propertyMix: { apartment: 0.92, builder_floor: 0.05, villa: 0.03 },
    micromarkets: [
      { id: "noi-sector-150", name: "Sector 150", psf: 6700, priceGrowth: 0.13, demand: 2600, demandGrowth: 0.11, supply: 2300, supplyGrowth: 0.07, affluence: 0.7 },
      { id: "noi-extension", name: "Noida Extension", psf: 4300, priceGrowth: 0.1, demand: 4600, demandGrowth: 0.08, supply: 4800, supplyGrowth: 0.06, affluence: 0.25 },
      { id: "noi-sector-137", name: "Sector 137", psf: 5900, priceGrowth: 0.095, demand: 2700, demandGrowth: 0.06, supply: 2600, supplyGrowth: 0.05, affluence: 0.4 },
      { id: "noi-sector-75", name: "Sector 75", psf: 6900, priceGrowth: 0.09, demand: 2300, demandGrowth: 0.05, supply: 2100, supplyGrowth: 0.04, affluence: 0.5 },
      { id: "noi-sector-62", name: "Sector 62", psf: 7400, priceGrowth: 0.085, demand: 2000, demandGrowth: 0.045, supply: 1800, supplyGrowth: 0.035, affluence: 0.55 },
    ],
  },
  {
    id: "gurugram",
    name: "Gurugram",
    state: "Haryana",
    region: "North · Delhi NCR",
    lat: 28.4595,
    lon: 77.0266,
    sizeFactor: 1.22,
    propertyMix: { apartment: 0.7, builder_floor: 0.22, villa: 0.08 },
    micromarkets: [
      { id: "gur-golf-course-rd", name: "Golf Course Road", psf: 17500, priceGrowth: 0.14, demand: 1900, demandGrowth: 0.1, supply: 1700, supplyGrowth: 0.08, affluence: 1 },
      { id: "gur-gcer", name: "Golf Course Extn Road", psf: 11800, priceGrowth: 0.15, demand: 2800, demandGrowth: 0.12, supply: 2600, supplyGrowth: 0.1, affluence: 0.85 },
      { id: "gur-dwarka-expy", name: "Dwarka Expressway", psf: 8200, priceGrowth: 0.17, demand: 3600, demandGrowth: 0.14, supply: 3700, supplyGrowth: 0.12, affluence: 0.65 },
      { id: "gur-sohna-rd", name: "Sohna Road", psf: 7600, priceGrowth: 0.11, demand: 3000, demandGrowth: 0.07, supply: 3200, supplyGrowth: 0.08, affluence: 0.5 },
      { id: "gur-new-gurgaon", name: "New Gurgaon", psf: 6500, priceGrowth: 0.12, demand: 2800, demandGrowth: 0.08, supply: 3000, supplyGrowth: 0.09, affluence: 0.45 },
    ],
  },
];
