/**
 * Chart design tokens. One palette for the whole product.
 *
 * Categorical slots were validated (lightness band, chroma floor, adjacent
 * CVD ΔE ≥ 8, normal-vision ΔE ≥ 15, ≥3:1 contrast) against the dark chart
 * surface #0C1C31. Colour follows the ENTITY, never its rank:
 *   demand → slot 1 (electric blue), supply → slot 2 (orange),
 *   price → slot 3 (aqua). Comparisons assign slots in selection order and
 *   survivors keep their colour when another entity is removed.
 */
export const chartColors = {
  surface: "#0C1C31",
  surfaceRaised: "#10243B",
  grid: "#16304D",
  axis: "#24406A",
  textPrimary: "#E8EEF7",
  textSecondary: "#A3AFC2",
  textMuted: "#8995A7",
  demand: "#318BFF",
  supply: "#E2702F",
  price: "#199E70",
  categorical: ["#318BFF", "#E2702F", "#199E70", "#C98500", "#D55181", "#9085E9"],
  /** ordinal ramp for ordered categories (BHK, budget, size) on dark surface */
  ordinal: ["#9EC5F4", "#6DA7EC", "#5598E7", "#3987E5", "#256ABF", "#184F95"],
  positive: "#20B486",
  negative: "#E56C70",
  neutral: "#5B6779",
};

export const fontStack = "var(--font-ui), Inter, system-ui, sans-serif";
export const monoStack = "var(--font-data), ui-monospace, monospace";

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
    axisLabel: { color: chartColors.textMuted, fontSize: 11, fontFamily: monoStack },
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
    backgroundColor: "#0A1729",
    borderColor: "#24406A",
    borderWidth: 1,
    padding: [10, 12],
    textStyle: { color: chartColors.textPrimary, fontSize: 12, fontFamily: fontStack },
    extraCssText: "box-shadow: 0 12px 32px rgba(0,0,0,0.45); border-radius: 4px;",
    axisPointer: {
      lineStyle: { color: "#3A5A85", width: 1 },
      crossStyle: { color: "#3A5A85" },
    },
  },
};
