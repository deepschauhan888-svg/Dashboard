/**
 * Chart design tokens — one palette for the whole product.
 *
 * Categorical slots were validated on the white surface (#FFFFFF) for the
 * lightness band, chroma floor, adjacent CVD ΔE ≥ 8, normal-vision ΔE ≥ 15
 * and ≥ 3:1 contrast. Red is the primary analytical series; the remaining
 * slots are restrained supporting hues.
 *
 * Colour follows the ENTITY, never its rank: demand → red, supply → steel
 * blue. Price, when plotted alone, uses the primary red. Comparisons assign
 * slots in selection order and survivors keep their colour.
 */
export const chartColors = {
  surface: "#FFFFFF",
  grid: "#F0F0F0",
  axis: "#D9D9D9",
  textPrimary: "#252525",
  textSecondary: "#5E5E5E",
  textMuted: "#747474",
  demand: "#B5122B",
  supply: "#3A76B4",
  price: "#B5122B",
  categorical: ["#B5122B", "#3A76B4", "#B8841A", "#16876A", "#8F55B5"],
  /** sequential red ramp (light → dark) for ordered categories and heatmaps */
  ordinal: ["#F5CDD3", "#EBA0AC", "#DB6478", "#C42F47", "#A0142B", "#6E0C1C"],
  /** diverging: supply-led (blue) ← neutral grey → demand-led (red) */
  diverging: ["#2F5F91", "#7FA4CC", "#EDEDED", "#DB6478", "#A0142B"],
  positive: "#24845D",
  negative: "#C44242",
  neutral: "#9A9A9A",
};

export const fontStack = "var(--font-ui), Inter, system-ui, sans-serif";

export const echartsTheme = {
  backgroundColor: "transparent",
  color: chartColors.categorical,
  textStyle: { fontFamily: fontStack, color: chartColors.textSecondary },
  grid: { left: 8, right: 16, top: 28, bottom: 8, containLabel: true },
  categoryAxis: {
    axisLine: { show: true, lineStyle: { color: chartColors.axis } },
    axisTick: { show: false },
    axisLabel: { color: chartColors.textMuted, fontSize: 11, fontFamily: fontStack },
    splitLine: { show: false },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: chartColors.textMuted, fontSize: 11, fontFamily: fontStack },
    splitLine: { show: true, lineStyle: { color: chartColors.grid, type: "solid", width: 1 } },
  },
  legend: {
    textStyle: { color: chartColors.textSecondary, fontSize: 12 },
    icon: "roundRect",
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 18,
  },
  tooltip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EAEAEA",
    borderWidth: 1,
    padding: [10, 12],
    textStyle: { color: chartColors.textPrimary, fontSize: 12, fontFamily: fontStack },
    extraCssText: "box-shadow: 0 10px 30px -12px rgba(0,0,0,0.18); border-radius: 4px;",
    axisPointer: {
      lineStyle: { color: "#BDBDBD", width: 1 },
      crossStyle: { color: "#BDBDBD" },
    },
  },
};
