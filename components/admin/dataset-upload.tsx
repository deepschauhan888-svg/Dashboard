"use client";

import { CircleCheck, Download, FileSpreadsheet, TriangleAlert, LoaderCircle, Rocket, CloudUpload, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, type DragEvent } from "react";
import { newId, useAdmin } from "@/lib/admin/admin-store";
import { DATASET_TYPES, buildTemplateCsv, validateDataset, type DatasetType, type ValidationReport } from "@/lib/admin/dataset-validation";
import { getDemoRecords } from "@/lib/data/demo/repository";
import { getDemoService } from "@/lib/services";
import { downloadBlob } from "@/lib/utils/download";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-controls";
import { AdminPageHeader, Panel } from "./admin-shell";
import { ValidationReportView } from "./validation-report";

type Step = 1 | 2 | 3 | 4;
const MAX_BYTES = 15 * 1024 * 1024;

export function DatasetUpload() {
  const catalog = useMemo(() => getDemoService().catalogSync(), []);
  const { uploads, update } = useAdmin();
  const [datasetType, setDatasetType] = useState<DatasetType>("market_facts");
  const [year, setYear] = useState(catalog.latestPeriod.year);
  const [quarter, setQuarter] = useState<number>(catalog.latestPeriod.quarter);
  const [cityId, setCityId] = useState<string>("all");
  const [micromarketId, setMicromarketId] = useState<string>("all");
  const cityObj = catalog.cities.find((c) => c.city_id === cityId);
  const [file, setFile] = useState<{ name: string; size: number; text: string | null; kind: "csv" | "excel" } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [busy, setBusy] = useState<null | "validate" | "publish">(null);
  const [published, setPublished] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const step: Step = published ? 4 : report ? 3 : file ? 2 : 1;

  async function accept(f: File) {
    setFileError(null);
    setReport(null);
    setPublished(null);
    const ext = f.name.toLowerCase().split(".").pop();
    if (!ext || !["csv", "xlsx", "xls"].includes(ext)) {
      setFileError("Unsupported file type. Upload a .csv, .xlsx or .xls file.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setFileError("File exceeds the 15 MB limit for browser preview.");
      return;
    }
    if (ext === "csv") setFile({ name: f.name, size: f.size, text: await f.text(), kind: "csv" });
    else setFile({ name: f.name, size: f.size, text: null, kind: "excel" });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void accept(f);
  }

  function loadSample(withErrors: boolean) {
    const csv = buildTemplateCsv(getDemoRecords(), year, quarter, cityId, withErrors, micromarketId);
    setFileError(null);
    setReport(null);
    setPublished(null);
    setFile({ name: `sample_${withErrors ? "with_errors_" : ""}${year}_Q${quarter}.csv`, size: csv.length, text: csv, kind: "csv" });
  }

  async function runValidation() {
    if (!file?.text) return;
    setBusy("validate");
    await new Promise((r) => setTimeout(r, 600));
    const r = validateDataset(file.text, { fileName: file.name, datasetType, year, quarter, cityId, micromarketId, catalog });
    setReport(r);
    update((s) => ({ ...s, lastReport: r }));
    setBusy(null);
  }

  async function publish() {
    if (!report?.publishable) return;
    setBusy("publish");
    await new Promise((r) => setTimeout(r, 800));
    const version = Math.max(0, ...uploads.map((u) => u.version)) + 1;
    update((s) => ({
      ...s,
      uploads: [
        {
          id: newId("u"),
          version,
          fileName: report.fileName,
          datasetType,
          period: `Q${quarter} ${year}`,
          cityId,
          rows: report.rowCount,
          status: "published",
          uploadedBy: "Demo MB Administrator",
          uploadedAt: new Date().toISOString(),
          errors: 0,
          warnings: report.issues.filter((i) => i.severity === "warning").length,
        },
        ...s.uploads.map((u) => (u.status === "published" ? { ...u, status: "superseded" as const } : u)),
      ],
    }));
    setPublished(version);
    setBusy(null);
  }

  function saveFailed() {
    if (!report) return;
    const version = Math.max(0, ...uploads.map((u) => u.version)) + 1;
    update((s) => ({
      ...s,
      uploads: [
        { id: newId("u"), version, fileName: report.fileName, datasetType, period: `Q${quarter} ${year}`, cityId, rows: report.rowCount, status: "failed", uploadedBy: "Demo MB Administrator", uploadedAt: new Date().toISOString(), errors: report.issues.filter((i) => i.severity === "error").length, warnings: report.issues.filter((i) => i.severity === "warning").length },
        ...s.uploads,
      ],
    }));
    reset();
  }

  function reset() {
    setFile(null);
    setReport(null);
    setPublished(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const steps = ["Dataset & period", "Upload file", "Validate", "Publish"];

  return (
    <div>
      <AdminPageHeader
        title="Dataset Upload"
        description="Upload a quarterly dataset, validate it against the platform schema and publish it as a new version. In this demo, validation runs in your browser and publishing updates the demo history only."
        actions={
          <Button variant="secondary" size="sm" onClick={() => downloadBlob(buildTemplateCsv(getDemoRecords(), year, quarter, cityId, false, micromarketId), `mbri_template_${year}_Q${quarter}.csv`, "text/csv")}>
            <Download className="h-3.5 w-3.5" aria-hidden /> Download CSV template
          </Button>
        }
      />

      <ol className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4" aria-label="Upload progress">
        {steps.map((s, i) => {
          const n = (i + 1) as Step;
          const done = n < step || (n === 4 && !!published);
          const current = n === step && !published;
          return (
            <li key={s} aria-current={current ? "step" : undefined} className={cn("flex items-center gap-2.5 rounded-xs px-3 py-2.5 text-[13px] ring-1 ring-inset", current ? "bg-brand-tint ring-brand/40" : done ? "bg-white ring-line" : "ring-line")}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10.5px]", done ? "bg-positive text-white" : current ? "bg-brand text-white" : "bg-mist text-ink-2")}>{done ? "✓" : n}</span>
              <span className={current || done ? "text-ink" : "text-ink-2"}>{s}</span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="1 · Dataset & reporting period">
          <div className="grid gap-4 p-5">
            <Select label="Dataset" value={datasetType} onChange={(e) => setDatasetType(e.target.value as DatasetType)} options={DATASET_TYPES.map((d) => ({ value: d.id, label: d.label, disabled: d.id !== "market_facts" }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Reporting year" value={String(year)} onChange={(e) => setYear(Number(e.target.value))} options={[...catalog.years, catalog.latestPeriod.year + 1].map((y) => ({ value: String(y), label: String(y) }))} />
              <Select label="Reporting quarter" value={String(quarter)} onChange={(e) => setQuarter(Number(e.target.value))} options={[1, 2, 3, 4].map((q) => ({ value: String(q), label: `Q${q}` }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="City" value={cityId} onChange={(e) => { setCityId(e.target.value); setMicromarketId("all"); }} options={[{ value: "all", label: "All cities" }, ...catalog.cities.map((c) => ({ value: c.city_id, label: c.city_name }))]} />
              <Select label="Micromarket" value={micromarketId} disabled={!cityObj} onChange={(e) => setMicromarketId(e.target.value)} options={[{ value: "all", label: cityObj ? "All micromarkets" : "Select a city" }, ...(cityObj?.micromarkets.map((m) => ({ value: m.micromarket_id, label: m.micromarket_name })) ?? [])]} />
            </div>
            <p className="text-[12px] leading-relaxed text-ink-2">Only “Market facts” is enabled in the demo. Other dataset types are listed to show the planned structure.</p>
          </div>
        </Panel>

        <Panel title="2 · Upload file" className="xl:col-span-2">
          <div className="p-5">
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                className={cn("flex flex-col items-center justify-center rounded-xs border border-dashed px-6 py-12 text-center transition-colors", drag ? "border-brand bg-brand-tint" : "border-line-strong")}
              >
                <CloudUpload className="h-8 w-8 text-brand" aria-hidden />
                <p className="mt-3 text-[14.5px] font-medium">Drag and drop a CSV or Excel file</p>
                <p className="mt-1 text-[12.5px] text-ink-2">Up to 15 MB · .csv, .xlsx, .xls</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Button size="sm" variant="primary" onClick={() => inputRef.current?.click()}>
                    Browse files
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => loadSample(false)}>
                    Use sample file
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => loadSample(true)}>
                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Sample with errors
                  </Button>
                </div>
                <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && void accept(e.target.files[0])} aria-label="Choose dataset file" />
                {fileError && <p className="mt-4 text-[12.5px] text-negative" role="alert">{fileError}</p>}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3 rounded-xs bg-paper p-4 ring-1 ring-inset ring-line">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileSpreadsheet className="h-6 w-6 shrink-0 text-brand" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium">{file.name}</p>
                      <p className="text-[12px] text-ink-2">
                        {(file.size / 1024).toFixed(1)} KB · {file.kind === "csv" ? "CSV" : "Excel workbook"} · for Q{quarter} {year} · {cityId === "all" ? "all cities" : `${micromarketId !== "all" ? `${cityObj?.micromarkets.find((m) => m.micromarket_id === micromarketId)?.micromarket_name}, ` : ""}${cityObj?.city_name}`}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={reset} className="rounded-xs p-1.5 text-ink-2 hover:bg-paper hover:text-ink" aria-label="Remove file">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {file.kind === "excel" ? (
                  <p className="mt-4 rounded-xs bg-caution/10 p-3 text-[13px] text-caution ring-1 ring-inset ring-caution/30">
                    Excel parsing will run server-side in the production ingestion pipeline. For the in-browser demo, export the sheet as CSV (or use the sample file) to preview and validate it.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button onClick={runValidation} disabled={busy !== null}>
                      {busy === "validate" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <CircleCheck className="h-4 w-4" aria-hidden />}
                      {report ? "Re-run validation" : "Validate dataset"}
                    </Button>
                    {report && (
                      <>
                        <Button variant="primary" onClick={publish} disabled={!report.publishable || busy !== null || !!published}>
                          {busy === "publish" ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : <Rocket className="h-4 w-4" aria-hidden />}
                          Publish as new version
                        </Button>
                        {!report.publishable && (
                          <Button variant="secondary" onClick={saveFailed}>
                            Record failed upload
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
                {published && (
                  <div className="mt-4 rounded-xs bg-positive/[0.08] p-4 text-[13.5px] ring-1 ring-inset ring-positive/30" role="status">
                    <p className="font-medium text-positive">Published as version v{published} (demo).</p>
                    <p className="mt-1 text-ink-2">
                      The dashboards continue to read the built-in demonstration dataset; in production, this step promotes the validated version to live. See{" "}
                      <Link href="/admin/history" className="text-brand underline-offset-2 hover:underline">
                        Upload history
                      </Link>{" "}
                      for rollback.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {report && (
        <div className="mt-6">
          <h2 className="mb-3 text-[16px] font-semibold">3 · Validation summary</h2>
          <ValidationReportView report={report} />
        </div>
      )}
    </div>
  );
}
