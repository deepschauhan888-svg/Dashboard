/**
 * Lazy, tree-shaken ECharts loader. Only the chart types and components the
 * product uses are bundled, and nothing is downloaded until a chart mounts.
 */
import { echartsTheme } from "./theme";

type CoreModule = typeof import("echarts/core");

let loading: Promise<CoreModule> | null = null;

export function loadECharts(): Promise<CoreModule> {
  if (!loading) {
    loading = Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        charts.LineChart,
        charts.BarChart,
        charts.ScatterChart,
        charts.HeatmapChart,
        charts.PieChart,
        components.GridComponent,
        components.TooltipComponent,
        components.LegendComponent,
        components.MarkLineComponent,
        components.MarkAreaComponent,
        components.MarkPointComponent,
        components.AriaComponent,
        components.VisualMapComponent,
        renderers.CanvasRenderer,
      ]);
      core.registerTheme("mbri", echartsTheme);
      return core;
    });
  }
  return loading;
}
