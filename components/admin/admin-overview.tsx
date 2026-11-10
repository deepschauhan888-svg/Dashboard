"use client";

import { ArrowUpRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/lib/admin/admin-store";
import { ConfirmButton } from "./confirm-button";
import { AdminPageHeader, Panel, td, th } from "./admin-shell";
import { StatusPill, uploadTone } from "./status-pill";

export function AdminOverview() {
  const { uploads, clients, cities, micromarkets, plans, settings, resetDemo } = useAdmin();
  const published = uploads.find((u) => u.status === "published");
  const activeClients = clients.filter((c) => c.status === "active").length;
  const users = clients.reduce((a, c) => a + c.users, 0);
  const stats = [
    { label: "Published dataset", value: published ? `v${published.version}` : "None", sub: published ? `${published.period} · ${published.rows.toLocaleString("en-IN")} rows` : "Upload to publish" },
    { label: "Active clients", value: String(activeClients), sub: `${clients.length} organisations total` },
    { label: "Client users", value: String(users), sub: "Across all organisations" },
    { label: "Cities configured", value: String(cities.length), sub: `${cities.filter((c) => c.coverage === "live").length} live · ${cities.filter((c) => c.coverage === "illustrative").length} illustrative` },
    { label: "Micromarkets", value: String(micromarkets.filter((m) => m.active).length), sub: `${micromarkets.filter((m) => !m.active).length} inactive` },
    { label: "Subscription plans", value: String(plans.length), sub: plans.map((p) => p.name).join(" · ") },
  ];
  const system = [
    { label: "Data provider", value: settings.dataProvider === "demo" ? "Demonstration dataset" : "Live API (not configured)", tone: "warn" as const },
    { label: "Authentication", value: "Demo access (frontend only)", tone: "warn" as const },
    { label: "Admin persistence", value: "Browser storage (demo)", tone: "warn" as const },
    { label: "Maintenance mode", value: settings.maintenanceMode ? "On" : "Off", tone: settings.maintenanceMode ? ("bad" as const) : ("good" as const) },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Admin Overview"
        description="Operational summary of datasets, clients and platform configuration."
        actions={
          <ConfirmButton title="Reset demo data?" description="This restores all demo admin data (uploads, cities, clients, plans, permissions and settings) in this browser to its original state." confirmLabel="Reset" danger onConfirm={resetDemo}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset demo data
          </ConfirmButton>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xs bg-ink-800 p-4 ring-1 ring-inset ring-ink-600/60">
            <p className="eyebrow !text-[10px] text-muted">{s.label}</p>
            <p className="mt-2 font-mono text-[24px]">{s.value}</p>
            <p className="mt-1 truncate text-[12px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          title="Recent uploads"
          className="xl:col-span-2"
          actions={
            <Link href="/admin/history" className="inline-flex items-center gap-1 text-[12.5px] text-signal-400 hover:text-signal-200">
              Full history <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-ink-600/60">
                  <th className={th}>Version</th>
                  <th className={th}>File</th>
                  <th className={th}>Period</th>
                  <th className={th}>Rows</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {uploads.slice(0, 6).map((u) => (
                  <tr key={u.id} className="border-b border-ink-700/60">
                    <td className={`${td} font-mono`}>v{u.version}</td>
                    <td className={`${td} text-white/85`}>{u.fileName}</td>
                    <td className={td}>{u.period}</td>
                    <td className={`${td} font-mono`}>{u.rows.toLocaleString("en-IN")}</td>
                    <td className={td}>
                      <StatusPill tone={uploadTone(u.status)}>{u.status.replace("_", " ")}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="System status">
          <ul className="divide-y divide-ink-700/60">
            {system.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="text-[13px] text-white/70">{s.label}</span>
                <StatusPill tone={s.tone}>{s.value}</StatusPill>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 border-t border-ink-600/50 p-4">
            {[
              ["Upload dataset", "/admin/upload"],
              ["Manage clients", "/admin/clients"],
              ["Permissions", "/admin/permissions"],
              ["Settings", "/admin/settings"],
            ].map(([l, h]) => (
              <Link key={h} href={h} className="rounded-xs bg-ink-900/60 px-3 py-2 text-[12.5px] text-white/80 ring-1 ring-inset ring-ink-600/60 hover:text-white hover:ring-ink-500">
                {l}
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
