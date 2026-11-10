"use client";

import Link from "next/link";
import { useAdmin } from "@/lib/admin/admin-store";
import { REQUIRED_COLUMNS } from "@/lib/admin/dataset-validation";
import { ButtonLink } from "@/components/ui/button";
import { AdminPageHeader, Panel, td, th } from "./admin-shell";
import { ValidationReportView } from "./validation-report";

const RULES = [
  ["Schema", "All required columns present; unknown columns ignored"],
  ["Geography", "city_id and micromarket_id exist in the master and belong together"],
  ["Period", "reporting_year / reporting_quarter match the selected period; quarter is 1–4"],
  ["Dimensions", "property_type and bhk_configuration use controlled vocabularies"],
  ["Measures", "demand, supply, inventory are non-negative integers; price and size are within plausible ranges"],
  ["Uniqueness", "No duplicate rows on the natural key"],
  ["Publishing", "Any error blocks publishing; warnings are recorded with the version"],
];

export function DataValidation() {
  const { lastReport } = useAdmin();
  return (
    <div>
      <AdminPageHeader title="Data Validation" description="The most recent validation report, and the rules every dataset must pass before it can be published." actions={<ButtonLink href="/admin/upload" size="sm">Validate a dataset</ButtonLink>} />
      {lastReport ? (
        <ValidationReportView report={lastReport} />
      ) : (
        <Panel>
          <div className="px-6 py-12 text-center">
            <p className="text-[15px] font-medium">No validation has been run yet</p>
            <p className="mt-1 text-[13px] text-muted">
              Go to{" "}
              <Link href="/admin/upload" className="text-signal-400 hover:underline">
                Dataset Upload
              </Link>{" "}
              and use a sample file to see a full report.
            </p>
          </div>
        </Panel>
      )}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Validation rules">
          <table className="w-full">
            <tbody>
              {RULES.map(([k, v]) => (
                <tr key={k} className="border-b border-ink-700/60">
                  <th scope="row" className={`${th} w-32 align-top text-white/85`}>{k}</th>
                  <td className={`${td} text-white/70`}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Required schema">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-5 font-mono text-[12.5px] text-white/80">
            {REQUIRED_COLUMNS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="border-t border-ink-600/50 px-5 py-3 text-[12px] text-muted">Ticket-size and property-size brackets are derived on ingestion from average_price × unit_size_sqft and unit_size_sqft.</p>
        </Panel>
      </div>
    </div>
  );
}
