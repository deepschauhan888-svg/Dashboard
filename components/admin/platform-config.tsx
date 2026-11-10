"use client";

import { Check, Lock, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { CAPABILITIES, ROLES, useAdmin, type Plan, type Settings } from "@/lib/admin/admin-store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Toggle } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import { AdminPageHeader, Panel, td, th } from "./admin-shell";
import { ConfirmButton } from "./confirm-button";

/* ------------------------------------------------------------ subscriptions */

export function SubscriptionManagement() {
  const { plans, clients, update } = useAdmin();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function save() {
    if (!editing) return;
    if (editing.seats < 1) return setErr("Seats must be at least 1.");
    const over = clients.filter((c) => c.plan === editing.id && c.users > editing.seats);
    if (over.length) return setErr(`${over.length} client(s) on this plan exceed ${editing.seats} seats. Reassign them first.`);
    update((s) => ({ ...s, plans: s.plans.map((p) => (p.id === editing.id ? editing : p)) }));
    setEditing(null);
  }

  return (
    <div>
      <AdminPageHeader title="Subscription Management" description="Plans, entitlements and plan assignments. Billing integration is planned for the backend phase." />
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((p) => {
          const count = clients.filter((c) => c.plan === p.id).length;
          return (
            <Panel key={p.id}>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="eyebrow !text-[10px] text-muted">Plan</p>
                    <h2 className="mt-1 text-[20px] font-semibold">{p.name}</h2>
                  </div>
                  <button type="button" onClick={() => { setErr(null); setEditing(p); }} className="rounded-xs p-1.5 text-muted hover:bg-white/5 hover:text-white" aria-label={`Edit ${p.name} plan`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                  <div><dt className="text-muted">Cities</dt><dd className="mt-0.5 font-mono text-[16px]">{p.cities === "all" ? "All" : p.cities}</dd></div>
                  <div><dt className="text-muted">Seats</dt><dd className="mt-0.5 font-mono text-[16px]">{p.seats}</dd></div>
                  <div><dt className="text-muted">Clients</dt><dd className="mt-0.5 font-mono text-[16px]">{count}</dd></div>
                </dl>
                <ul className="mt-4 space-y-1.5 border-t border-ink-600/50 pt-4 text-[13px] text-white/75">
                  {p.modules.map((m) => <li key={m} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-signal-400" aria-hidden />{m}</li>)}
                  <li className={cn("flex items-center gap-2", !p.exports && "text-white/35 line-through")}><Check className="h-3.5 w-3.5 text-signal-400" aria-hidden />Data exports</li>
                </ul>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="Plan assignments" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-ink-600/60">{["Organisation", "Users", "Plan", "Seat usage"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>
              {clients.map((c) => {
                const plan = plans.find((p) => p.id === c.plan);
                const pct = plan ? Math.min(100, (c.users / plan.seats) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-ink-700/60">
                    <td className={`${td} font-medium`}>{c.name}</td>
                    <td className={`${td} font-mono`}>{c.users}</td>
                    <td className={td}>
                      <select
                        aria-label={`Plan for ${c.name}`}
                        value={c.plan}
                        onChange={(e) => update((s) => ({ ...s, clients: s.clients.map((x) => (x.id === c.id ? { ...x, plan: e.target.value } : x)) }))}
                        className="h-7 rounded-xs bg-ink-850 px-2 text-[12px] text-white ring-1 ring-inset ring-ink-600"
                      >
                        {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink-700"><div className={cn("h-full rounded-full", c.users > (plan?.seats ?? 0) ? "bg-negative" : "bg-signal-500")} style={{ width: `${pct}%` }} /></div>
                        <span className={cn("font-mono text-[12px]", c.users > (plan?.seats ?? 0) ? "text-negative" : "text-muted")}>{c.users}/{plan?.seats}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.name} plan`} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save plan</Button></>}>
        {editing && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Seats" htmlFor="pl-seats" skin="dark"><Input id="pl-seats" skin="dark" type="number" min={1} value={editing.seats} onChange={(e) => setEditing({ ...editing, seats: Number(e.target.value) })} /></Field>
              <Select label="Cities" value={String(editing.cities)} onChange={(e) => setEditing({ ...editing, cities: e.target.value === "all" ? "all" : Number(e.target.value) })} options={[...[1, 3, 5].map((n) => ({ value: String(n), label: String(n) })), { value: "all", label: "All cities" }]} />
            </div>
            <Toggle checked={editing.exports} onChange={(v) => setEditing({ ...editing, exports: v })} label="Data exports" description="Allow CSV / image exports from dashboards" />
            {err && <p className="text-[12.5px] text-negative" role="alert">{err}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* -------------------------------------------------------------- permissions */

export function AccessPermissions() {
  const { permissions, update } = useAdmin();
  return (
    <div>
      <AdminPageHeader title="Access Permissions" description="Role-based capabilities. In production these map to row-level security policies and organisation-scoped access in the database." />
      <Panel title="Role capability matrix">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-ink-600/60">
                <th className={th}>Capability</th>
                {ROLES.map((r) => <th key={r} className={`${th} text-center`}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (
                <tr key={cap} className="border-b border-ink-700/60">
                  <th scope="row" className={`${td} text-left font-normal text-white/85`}>{cap}</th>
                  {ROLES.map((r) => {
                    const locked = r === "MB administrator";
                    const on = permissions[r].includes(cap);
                    return (
                      <td key={r} className={`${td} text-center`}>
                        {locked ? (
                          <Lock className="mx-auto h-3.5 w-3.5 text-muted" aria-label="Always granted" />
                        ) : (
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-signal-500"
                            aria-label={`${r}: ${cap}`}
                            checked={on}
                            onChange={(e) =>
                              update((s) => ({
                                ...s,
                                permissions: { ...s.permissions, [r]: e.target.checked ? [...s.permissions[r], cap] : s.permissions[r].filter((c) => c !== cap) },
                              }))
                            }
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-ink-600/50 px-5 py-3 text-[12px] text-muted">MB administrator holds every capability and cannot be edited. Changes are stored in this browser for the demo.</p>
      </Panel>
    </div>
  );
}

/* ----------------------------------------------------------------- settings */

export function PlatformSettings() {
  const { settings, update, resetDemo } = useAdmin();
  const [draft, setDraft] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(settings), [settings]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const timeoutInvalid = !Number.isInteger(draft.sessionTimeoutMins) || draft.sessionTimeoutMins < 5 || draft.sessionTimeoutMins > 720;

  return (
    <div>
      <AdminPageHeader
        title="Platform Settings"
        description="Global behaviour of the platform. Saved to this browser in the demo; in production, persisted server-side with an audit trail."
        actions={
          <>
            <Button size="sm" variant="secondary" disabled={!dirty} onClick={() => setDraft(settings)}>Discard</Button>
            <Button size="sm" disabled={!dirty || timeoutInvalid} onClick={() => { update((s) => ({ ...s, settings: draft })); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
              {saved ? <><Check className="h-3.5 w-3.5" aria-hidden /> Saved</> : "Save changes"}
            </Button>
          </>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Access & security">
          <div className="space-y-5 p-5">
            <Toggle checked={draft.requireMfa} onChange={(v) => setDraft({ ...draft, requireMfa: v })} label="Require multi-factor authentication" description="Enforced by the identity provider once live auth is connected" />
            <Field label="Session timeout (minutes)" htmlFor="set-timeout" skin="dark" error={timeoutInvalid ? "Enter a whole number between 5 and 720." : null}>
              <Input id="set-timeout" skin="dark" type="number" min={5} max={720} value={draft.sessionTimeoutMins} onChange={(e) => setDraft({ ...draft, sessionTimeoutMins: Number(e.target.value) })} invalid={timeoutInvalid} />
            </Field>
            <Toggle checked={draft.allowExports} onChange={(v) => setDraft({ ...draft, allowExports: v })} label="Allow data exports" description="Global switch; plan entitlements still apply" />
          </div>
        </Panel>
        <Panel title="Data & presentation">
          <div className="space-y-5 p-5">
            <Select label="Data provider" value={draft.dataProvider} onChange={(e) => setDraft({ ...draft, dataProvider: e.target.value as Settings["dataProvider"] })} options={[{ value: "demo", label: "Demonstration dataset" }, { value: "api", label: "Live API (requires backend)", disabled: true }]} />
            <Toggle checked={draft.showDemoBanner} onChange={(v) => setDraft({ ...draft, showDemoBanner: v })} label="Show demonstration-data labels" description="Must remain on while synthetic data is displayed" disabled />
            <Toggle checked={draft.defaultPeriodLatest} onChange={(v) => setDraft({ ...draft, defaultPeriodLatest: v })} label="Default dashboards to the latest quarter" />
            <Toggle checked={draft.maintenanceMode} onChange={(v) => setDraft({ ...draft, maintenanceMode: v })} label="Maintenance mode" description="Shows a maintenance notice to client users" />
          </div>
        </Panel>
      </div>
      <Panel title="Demo data" className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <p className="text-[13.5px] text-white/70">Restore all admin demo data (uploads, cities, clients, plans, permissions, settings) to the original state.</p>
          <ConfirmButton title="Reset demo data?" description="All demo admin changes in this browser will be discarded." confirmLabel="Reset" danger onConfirm={resetDemo}>Reset demo data</ConfirmButton>
        </div>
      </Panel>
    </div>
  );
}
