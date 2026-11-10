"use client";

import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import type { ValidationReport } from "@/lib/admin/dataset-validation";
import { cn } from "@/lib/utils/cn";
import { downloadCsv } from "@/lib/utils/download";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Panel, td, th } from "./admin-shell";

export function ValidationReportView({ report }: { report: ValidationReport }) {
  const [sev, setSev] = useState<"all" | "error" | "warning">("all");
  const issues = useMemo(() => report.issues.filter((i) => sev === "all" || i.severity === sev), [report, sev]);
  const errors = report.issues.filter((i) => i.severity === "error").length;
  const warnings = report.issues.filter((i) => i.severity === "warning").length;

  return (
    <div className="space-y-4">
      <div className={cn("flex flex-wrap items-center justify-between gap-4 rounded-xs p-4 ring-1 ring-inset", report.publishable ? "bg-positive/[0.07] ring-positive/30" : "bg-negative/[0.07] ring-negative/30")} role="status">
        <div className="flex items-center gap-3">
          {report.publishable ? <CircleCheck className="h-6 w-6 text-positive" aria-hidden /> : <CircleX className="h-6 w-6 text-negative" aria-hidden />}
          <div>
            <p className="text-[15px] font-semibold">{report.publishable ? "Validation passed — ready to publish" : "Validation failed — fix errors before publishing"}</p>
            <p className="text-[12.5px] text-ink-2">
              {report.fileName} · {report.rowCount.toLocaleString("en-IN")} rows · Q{report.period.quarter} {report.period.year} · {errors} errors · {warnings} warnings
            </p>
          </div>
        </div>
        <dl className="flex gap-6 text-right">
          {(["demand", "supply", "inventory"] as const).map((k) => (
            <div key={k}>
              <dt className="text-[11px] capitalize text-ink-2">Σ {k}</dt>
              <dd className="text-[14px]">{report.totals[k].toLocaleString("en-IN")}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Panel title="Validation checks" className="xl:col-span-2">
          <ul className="divide-y divide-line">
            {report.checks.map((c) => (
              <li key={c.id} className="flex items-start gap-3 px-5 py-3">
                {c.status === "pass" ? <CircleCheck className="mt-0.5 h-4 w-4 text-positive" aria-label="Pass" /> : c.status === "warn" ? <TriangleAlert className="mt-0.5 h-4 w-4 text-caution" aria-label="Warning" /> : <CircleX className="mt-0.5 h-4 w-4 text-negative" aria-label="Fail" />}
                <div>
                  <p className="text-[13.5px]">{c.label}</p>
                  <p className="text-[12px] text-ink-2">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title={`Issues (${report.issues.length}${report.issues.length >= 500 ? "+" : ""})`}
          className="xl:col-span-3"
          actions={
            <div className="flex items-center gap-2">
              <Segmented ariaLabel="Severity" value={sev} onChange={setSev} options={[{ value: "all", label: "All" }, { value: "error", label: "Errors" }, { value: "warning", label: "Warnings" }]} />
              <Button size="sm" variant="secondary" disabled={!report.issues.length} onClick={() => downloadCsv(`validation-${report.fileName}`, ["Row", "Column", "Severity", "Message"], report.issues.map((i) => [i.row || "file", i.column, i.severity, i.message]))}>
                Export
              </Button>
            </div>
          }
        >
          {issues.length ? (
            <div className="max-h-[320px] overflow-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-line">
                    <th className={th}>Row</th>
                    <th className={th}>Column</th>
                    <th className={th}>Severity</th>
                    <th className={th}>Message</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((i, idx) => (
                    <tr key={idx} className="border-b border-line">
                      <td className={`${td} text-ink`}>{i.row || "file"}</td>
                      <td className={`${td} text-ink`}>{i.column}</td>
                      <td className={td}>
                        <span className={i.severity === "error" ? "text-negative" : "text-caution"}>{i.severity}</span>
                      </td>
                      <td className={`${td} text-ink`}>{i.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-8 text-center text-[13px] text-ink-2">No issues in this category.</p>
          )}
        </Panel>
      </div>

      <Panel title="Upload preview (first 12 rows)">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-line">
                <th className={th}>#</th>
                {report.columns.map((c) => (
                  <th key={c} className={`${th} tabular`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.preview.map((r, ri) => {
                const rowIssues = report.issues.filter((i) => i.row === ri + 1);
                return (
                  <tr key={ri} className={cn("border-b border-line", rowIssues.some((i) => i.severity === "error") && "bg-negative/[0.06]")}>
                    <td className={`${td} text-ink-2`}>{ri + 1}</td>
                    {report.columns.map((c, ci) => {
                      const bad = rowIssues.find((i) => i.column === c);
                      return (
                        <td key={c} title={bad?.message} className={cn(td, "text-[12px]", bad ? (bad.severity === "error" ? "text-negative" : "text-caution") : "text-ink")}>
                          {r[ci]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
