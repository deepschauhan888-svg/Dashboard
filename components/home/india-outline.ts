/**
 * SCHEMATIC outline of India as [longitude, latitude] pairs — a hand-simplified
 * polygon for UI purposes only, NOT a cartographic boundary.
 *
 * Before public release, replace with an official Survey of India–compliant
 * boundary (e.g. a simplified GeoJSON derived from the official map) to meet
 * Indian map-depiction requirements.
 */
export const INDIA_OUTLINE: [number, number][] = [
  [74.6, 37.0], [75.8, 36.7], [77.0, 35.9], [78.0, 35.5], [79.5, 35.4], [80.3, 35.3], [80.1, 34.3],
  [79.4, 33.2], [78.8, 32.6], [78.6, 31.9], [79.0, 31.2], [79.9, 30.8], [80.9, 30.2], [80.1, 28.8],
  [81.2, 28.4], [82.5, 27.5], [83.3, 27.4], [84.1, 27.5], [85.2, 26.8], [86.0, 26.6], [87.0, 26.4],
  [88.1, 26.4], [88.0, 27.1], [88.1, 27.9], [88.8, 28.0], [88.9, 27.3], [89.1, 26.8], [90.5, 26.8],
  [92.1, 26.9], [92.1, 27.8], [93.0, 28.4], [94.0, 29.2], [95.5, 29.3], [96.3, 29.4], [97.0, 28.5],
  [97.4, 28.2], [96.6, 27.3], [95.8, 27.0], [95.2, 26.6], [94.7, 25.5], [94.6, 25.0], [94.2, 23.9],
  [93.4, 23.9], [93.4, 23.0], [93.2, 22.2], [92.7, 21.95], [92.3, 22.6], [92.2, 23.6], [91.9, 23.4],
  [91.6, 22.95], [91.2, 23.6], [91.6, 24.2], [92.2, 24.4], [92.4, 25.0], [91.0, 25.2], [89.9, 25.3],
  [89.8, 26.0], [89.0, 26.2], [88.5, 26.3], [88.1, 25.6], [88.4, 24.9], [88.7, 24.3], [88.8, 23.4],
  [89.0, 22.5], [89.1, 21.7], [88.0, 21.6], [87.4, 21.6], [86.9, 21.0], [86.8, 20.4], [86.4, 20.0],
  [85.4, 19.6], [84.8, 19.2], [84.1, 18.4], [83.3, 17.7], [82.3, 16.6], [81.3, 16.3], [81.1, 15.8],
  [80.3, 15.5], [80.1, 14.4], [80.3, 13.2], [80.0, 12.3], [79.8, 11.4], [79.85, 10.3], [79.2, 10.3],
  [79.0, 9.4], [78.2, 8.9], [77.5, 8.1], [76.6, 8.9], [76.2, 9.9], [75.8, 11.2], [75.4, 11.9],
  [74.8, 12.9], [74.4, 14.3], [73.9, 15.4], [73.4, 16.4], [73.0, 17.8], [72.8, 19.0], [72.7, 20.3],
  [72.8, 21.2], [72.6, 22.2], [72.2, 21.4], [71.6, 21.0], [71.0, 20.7], [70.0, 21.1], [69.0, 22.3],
  [69.8, 22.5], [70.3, 22.9], [69.6, 22.9], [68.6, 23.2], [68.2, 23.6], [68.8, 24.3], [70.0, 24.2],
  [71.1, 24.6], [70.6, 25.7], [70.1, 26.5], [69.6, 27.2], [70.5, 28.0], [71.9, 27.9], [72.9, 29.1],
  [73.6, 29.9], [74.5, 30.9], [74.6, 31.9], [75.3, 32.3], [74.6, 32.8], [73.6, 33.0], [73.4, 34.3],
  [72.6, 35.0], [71.8, 36.0], [73.0, 36.9],
];

export const MAP_BOUNDS = { minLon: 67.6, maxLon: 97.8, minLat: 7.6, maxLat: 37.4 };
export const MAP_SCALE = 20;
/** latitude stretch to approximate the visual aspect of a conformal projection */
export const LAT_STRETCH = 1.08;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - MAP_BOUNDS.minLon) * MAP_SCALE, (MAP_BOUNDS.maxLat - lat) * MAP_SCALE * LAT_STRETCH];
}

export const MAP_WIDTH = (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) * MAP_SCALE;
export const MAP_HEIGHT = (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) * MAP_SCALE * LAT_STRETCH;

export function outlinePath(): string {
  return INDIA_OUTLINE.map(([lon, lat], i) => {
    const [x, y] = project(lon, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";
}
