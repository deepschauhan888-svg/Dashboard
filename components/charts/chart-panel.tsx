"use client";

import type { EChartsOption } from "echarts";
import { ChartLine, Download, ImageDown, Table2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { downloadCsv, downloadDataUrl, slugify, type CsvCell } from "@/lib/utils/download";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { EChart, type EChartHandle } from "./echart";

export interface TableData {
  columns: string[];
  rows: CsvCell[][];
}

/**
 * Standard analytical section: title + unit line, actions (chart/table toggle,
 * PNG and CSV export) and loading / empty / error states. Deliberately
 * undecorated — a fine border and whitespace, no card chrome.
 * The table view is the accessible equivalent of every chart.
 */
export function ChartPanel({
  title,
  subtitle,
  option,
  table,
  height = 300,
  loading,
  error,
  empty,
  controls,
  footer,
  className,
}: {
  title: string;
  subtitle?: string;
  option: EChartsOption | null;
  table?: TableData;
  height?: number;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  controls?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const handle = useRef<EChartHandle | null>(null);
  const filename = slugify(title);

  return (
    <section className={cn("flex min-w-0 flex-col rounded-sm border border-line bg-white", className)} aria-label={title}>
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-2">{subtitle}</p>}
        </div>
        <div className="no-print flex items-center gap-1">
          {controls}
          {table && (
            <IconBtn label={view === "chart" ? "Show as table" : "Show as chart"} onClick={() => setView(view === "chart" ? "table" : "chart")} active={view === "table"}>
              {view === "chart" ? <Table2 className="h-4 w-4" /> : <ChartLine className="h-4 w-4" />}
            </IconBtn>
          )}
          {option && (
            <IconBtn
              label="Download chart as PNG"
              onClick={() => {
                const url = handle.current?.getDataURL();
                if (url) downloadDataUrl(url, `${filename}.png`);
              }}
            >
              <ImageDown className="h-4 w-4" />
            </IconBtn>
          )}
          {table && (
            <IconBtn label="Download data as CSV" onClick={() => downloadCsv(filename, table.columns, table.rows)}>
              <Download className="h-4 w-4" />
            </IconBtn>
          )}
        </div>
      </header>
      <div className="flex-1 px-3 pb-3 sm:px-4">
        {error ? (
          <ErrorState message={error} />
        ) : loading && !option ? (
          <div className="animate-pulse rounded-xs bg-paper" style={{ height }} />
        ) : empty ? (
          <EmptyState title="No data for this selection" className="min-h-[200px]">
            The demonstration dataset has no records for the current filters. Try another city, configuration or period.
          </EmptyState>
        ) : view === "table" && table ? (
          <DataTable table={table} maxHeight={height} />
        ) : option ? (
          <div className={cn("transition-opacity", loading && "opacity-50")}>
            <EChart option={option} height={height} ariaLabel={`${title} chart. Use the table view for exact values.`} onReady={(h) => (handle.current = h)} />
          </div>
        ) : null}
      </div>
      {footer && <div className="border-t border-line px-5 py-3 text-[12.5px] text-ink-2">{footer}</div>}
    </section>
  );
}

function IconBtn({ label, onClick, children, active }: { label: string; onClick: () => void; children: ReactNode; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active} className={cn("rounded-xs p-1.5 text-ink-2 transition-colors hover:bg-mist hover:text-ink", active && "bg-mist text-ink")}>
      {children}
    </button>
  );
}

export function DataTable({ table, maxHeight }: { table: TableData; maxHeight?: number }) {
  return (
    <div className="overflow-auto scrollbar-thin" style={{ maxHeight }}>
      <table className="w-full border-collapse text-left text-[13px]">
        <thead className="sticky top-0 bg-white">
          <tr>
            {table.columns.map((c, i) => (
              <th key={c} scope="col" className={cn("border-b border-line-strong px-3 py-2 text-[12px] font-medium text-ink-2", i > 0 && "text-right")}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, ri) => (
            <tr key={ri} className="border-b border-line hover:bg-paper">
              {r.map((cell, ci) => (
                <td key={ci} className={cn("px-3 py-2 tabular", ci === 0 ? "text-ink" : "text-right text-ink")}>
                  {cell ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
