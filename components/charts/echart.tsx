"use client";

import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";
import { useEffect, useRef, useState } from "react";
import { loadECharts } from "@/lib/charts/loader";
import { cn } from "@/lib/utils/cn";

export interface EChartHandle {
  getDataURL: () => string | null;
}

/**
 * Thin, lifecycle-safe ECharts wrapper. Lazy-loads ECharts on mount,
 * re-applies options on change, resizes with its container and disposes
 * cleanly. Interaction (tooltips, legend toggling) is native ECharts.
 */
export function EChart({
  option,
  height = 280,
  className,
  ariaLabel,
  onReady,
}: {
  option: EChartsOption;
  height?: number | string;
  className?: string;
  ariaLabel: string;
  onReady?: (handle: EChartHandle) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const chart = useRef<EChartsType | null>(null);
  const latest = useRef(option);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  latest.current = option;

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | null = null;
    loadECharts()
      .then((ec) => {
        if (disposed || !el.current) return;
        const instance = ec.init(el.current, "mbri", { renderer: "canvas" });
        chart.current = instance;
        instance.setOption(latest.current, { notMerge: true });
        ro = new ResizeObserver(() => instance.resize());
        ro.observe(el.current);
        setStatus("ready");
        onReady?.({
          getDataURL: () =>
            chart.current ? chart.current.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#FFFFFF" }) : null,
        });
      })
      .catch(() => !disposed && setStatus("error"));
    return () => {
      disposed = true;
      ro?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true });
  }, [option]);

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <div ref={el} className="absolute inset-0" role="img" aria-label={ariaLabel} />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-end gap-1.5 px-2 pb-6 pt-10" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 animate-pulse rounded-t-xs bg-mist" style={{ height: `${30 + ((i * 37) % 55)}%` }} />
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-ink-2">Chart engine failed to load.</div>
      )}
    </div>
  );
}
