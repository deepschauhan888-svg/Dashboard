"use client";

import { Check, Lock, Pencil } from "lucide-react";
import { useState } from "react";
import { CAPABILITIES, ROLES, useAdmin, type Plan } from "@/lib/admin/admin-store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Toggle } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import { AdminPageHeader, Panel, td, th } from "./admin-shell";

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
                    <p className="kicker !text-[10px] text-ink-2">Plan</p>
                    <h2 className="mt-1 text-[20px] font-semibold">{p.name}</h2>
                  </div>
                  <button type="button" onClick={() => { setErr(null); setEditing(p); }} className="rounded-xs p-1.5 text-ink-2 hover:bg-paper hover:text-ink" aria-label={`Edit ${p.name} plan`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                  <div><dt className="text-ink-2">Cities</dt><dd className="mt-0.5 text-[16px]">{p.cities === "all" ? "All" : p.cities}</dd></div>
                  <div><dt className="text-ink-2">Seats</dt><dd className="mt-0.5 text-[16px]">{p.seats}</dd></div>
                  <div><dt className="text-ink-2">Clients</dt><dd className="mt-0.5 text-[16px]">{count}</dd></div>
                </dl>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-[13px] text-ink">
                  {p.modules.map((m) => <li key={m} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-brand" aria-hidden />{m}</li>)}
                  <li className={cn("flex items-center gap-2", !p.exports && "text-ink-3 line-through")}><Check className="h-3.5 w-3.5 text-brand" aria-hidden />Data exports</li>
                </ul>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel title="Plan assignments" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-line">{["Organisation", "Users", "Plan", "Seat usage"].map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
            <tbody>
              {clients.map((c) => {
                const plan = plans.find((p) => p.id === c.plan);
                const pct = plan ? Math.min(100, (c.users / plan.seats) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-line">
                    <td className={`${td} font-medium`}>{c.name}</td>
                    <td className={`${td} tabular`}>{c.users}</td>
                    <td className={td}>
                      <select
                        aria-label={`Plan for ${c.name}`}
                        value={c.plan}
                        onChange={(e) => update((s) => ({ ...s, clients: s.clients.map((x) => (x.id === c.id ? { ...x, plan: e.target.value } : x)) }))}
                        className="h-7 rounded-xs bg-white px-2 text-[12px] text-ink ring-1 ring-inset ring-line-strong"
                      >
                        {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-mist"><div className={cn("h-full rounded-full", c.users > (plan?.seats ?? 0) ? "bg-negative" : "bg-brand")} style={{ width: `${pct}%` }} /></div>
                        <span className={cn("text-[12px]", c.users > (plan?.seats ?? 0) ? "text-negative" : "text-ink-2")}>{c.users}/{plan?.seats}</span>
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
              <Field label="Seats" htmlFor="pl-seats"><Input id="pl-seats" type="number" min={1} value={editing.seats} onChange={(e) => setEditing({ ...editing, seats: Number(e.target.value) })} /></Field>
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
              <tr className="border-b border-line">
                <th className={th}>Capability</th>
                {ROLES.map((r) => <th key={r} className={`${th} text-center`}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (
                <tr key={cap} className="border-b border-line">
                  <th scope="row" className={`${td} text-left font-normal text-ink`}>{cap}</th>
                  {ROLES.map((r) => {
                    const locked = r === "MB administrator";
                    const on = permissions[r].includes(cap);
                    return (
                      <td key={r} className={`${td} text-center`}>
                        {locked ? (
                          <Lock className="mx-auto h-3.5 w-3.5 text-ink-2" aria-label="Always granted" />
                        ) : (
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-brand"
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
        <p className="border-t border-line px-5 py-3 text-[12px] text-ink-2">MB administrator holds every capability and cannot be edited. Changes are stored in this browser for the demo.</p>
      </Panel>
    </div>
  );
}

