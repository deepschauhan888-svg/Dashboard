"use client";

import { Undo2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdmin, type UploadStatus } from "@/lib/admin/admin-store";
import { downloadCsv } from "@/lib/utils/download";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { AdminPageHeader, Panel, td, th } from "./admin-shell";
import { ConfirmButton } from "./confirm-button";
import { StatusPill, uploadTone } from "./status-pill";

export function UploadHistory() {
  const { uploads, update } = useAdmin();
  const [filter, setFilter] = useState<"all" | UploadStatus>("all");
  const rows = useMemo(() => uploads.filter((u) => filter === "all" || u.status === filter), [uploads, filter]);
  const current = uploads.find((u) => u.status === "published");
  const previous = uploads.find((u) => u.status === "superseded");

  function rollback() {
    if (!current || !previous) return;
    update((s) => ({
      ...s,
      uploads: s.uploads.map((u) => (u.id === current.id ? { ...u, status: "rolled_back" } : u.id === previous.id ? { ...u, status: "published" } : u)),
    }));
  }

  return (
    <div>
      <AdminPageHeader
        title="Upload History"
        description="Every dataset version with its validation outcome. Exactly one version is published at a time; rolling back re-publishes the previous version."
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => downloadCsv("upload-history", ["Version", "File", "Dataset", "Period", "City", "Rows", "Status", "Errors", "Warnings", "Uploaded by", "Uploaded at"], uploads.map((u) => [u.version, u.fileName, u.datasetType, u.period, u.cityId, u.rows, u.status, u.errors, u.warnings, u.uploadedBy, u.uploadedAt]))}>
              Export log
            </Button>
            {current && previous && (
              <ConfirmButton title={`Roll back v${current.version}?`} description={`Version v${current.version} (${current.period}) will be marked as rolled back and v${previous.version} (${previous.period}) re-published. In this demo the change affects the history log only.`} confirmLabel="Roll back" danger onConfirm={rollback}>
                <Undo2 className="h-3.5 w-3.5" aria-hidden /> Roll back to v{previous.version}
              </ConfirmButton>
            )}
          </>
        }
      />
      <Panel
        title={`${rows.length} version${rows.length === 1 ? "" : "s"}`}
        actions={
          <Segmented
            ariaLabel="Status filter"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "published", label: "Published" },
              { value: "superseded", label: "Superseded" },
              { value: "failed", label: "Failed" },
              { value: "rolled_back", label: "Rolled back" },
            ]}
          />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-ink-600/60">
                {["Version", "File", "Period", "Scope", "Rows", "Errors / warnings", "Status", "Uploaded"].map((h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-ink-700/60">
                  <td className={`${td} font-mono`}>v{u.version}</td>
                  <td className={`${td} text-white/85`}>{u.fileName}</td>
                  <td className={td}>{u.period}</td>
                  <td className={td}>{u.cityId === "all" ? "All cities" : u.cityId}</td>
                  <td className={`${td} font-mono`}>{u.rows.toLocaleString("en-IN")}</td>
                  <td className={`${td} font-mono`}>
                    <span className={u.errors ? "text-negative" : "text-white/60"}>{u.errors}</span> / <span className={u.warnings ? "text-caution" : "text-white/60"}>{u.warnings}</span>
                  </td>
                  <td className={td}>
                    <StatusPill tone={uploadTone(u.status)}>{u.status.replace("_", " ")}</StatusPill>
                  </td>
                  <td className={`${td} text-white/60`}>
                    {new Date(u.uploadedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    <span className="block text-[11.5px] text-muted">{u.uploadedBy}</span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[13px] text-muted">
                    No uploads with this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
