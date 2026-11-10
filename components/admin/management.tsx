"use client";

import { Pencil, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { newId, useAdmin, type AdminCity, type AdminClient, type AdminMicromarket } from "@/lib/admin/admin-store";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { Modal } from "@/components/ui/modal";
import { AdminPageHeader, Panel, td, th } from "./admin-shell";
import { StatusPill } from "./status-pill";

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="h-8 w-56 rounded-sm bg-ink-850 pl-8 pr-2 text-[12.5px] text-white outline-none ring-1 ring-inset ring-ink-600 placeholder:text-muted focus:ring-signal-500" />
    </div>
  );
}

const COVERAGE_TONE = { live: "good", illustrative: "info", planned: "warn", hidden: "muted" } as const;

/* ------------------------------------------------------------------ cities */

export function CityManagement() {
  const { cities, update } = useAdmin();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminCity | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const rows = useMemo(() => cities.filter((c) => !q || `${c.name} ${c.state} ${c.region}`.toLowerCase().includes(q.toLowerCase())), [cities, q]);

  function save() {
    if (!editing) return;
    if (editing.name.trim().length < 2 || editing.state.trim().length < 2) return setErr("City name and state are required.");
    if (isNew && cities.some((c) => c.name.toLowerCase() === editing.name.trim().toLowerCase())) return setErr("A city with this name already exists.");
    update((s) => ({ ...s, cities: isNew ? [...s.cities, { ...editing, name: editing.name.trim() }] : s.cities.map((c) => (c.id === editing.id ? editing : c)) }));
    setEditing(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="City Management"
        description="Cities available on the platform and how their coverage is presented publicly. Coverage status drives the website map."
        actions={
          <Button size="sm" onClick={() => { setErr(null); setIsNew(true); setEditing({ id: newId("city-"), name: "", state: "", region: "North", coverage: "planned", micromarkets: 0 }); }}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add city
          </Button>
        }
      />
      <Panel title={`${rows.length} cities`} actions={<SearchBox value={q} onChange={setQ} placeholder="Search cities" />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-ink-600/60">
                {["City", "State", "Region", "Micromarkets", "Coverage", ""].map((h) => <th key={h} className={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-ink-700/60">
                  <td className={`${td} font-medium`}>{c.name}</td>
                  <td className={`${td} text-white/70`}>{c.state}</td>
                  <td className={`${td} text-white/70`}>{c.region}</td>
                  <td className={`${td} font-mono`}>{c.micromarkets}</td>
                  <td className={td}>
                    <select
                      aria-label={`Coverage status for ${c.name}`}
                      value={c.coverage}
                      onChange={(e) => update((s) => ({ ...s, cities: s.cities.map((x) => (x.id === c.id ? { ...x, coverage: e.target.value as AdminCity["coverage"] } : x)) }))}
                      className="h-7 rounded-xs bg-ink-850 px-2 text-[12px] text-white ring-1 ring-inset ring-ink-600"
                    >
                      {["live", "illustrative", "planned", "hidden"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <span className="ml-2"><StatusPill tone={COVERAGE_TONE[c.coverage]}>{c.coverage}</StatusPill></span>
                  </td>
                  <td className={`${td} text-right`}>
                    <button type="button" onClick={() => { setErr(null); setIsNew(false); setEditing(c); }} className="rounded-xs p-1.5 text-muted hover:bg-white/5 hover:text-white" aria-label={`Edit ${c.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Add city" : `Edit ${editing?.name}`} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        {editing && (
          <div className="grid gap-4">
            <Field label="City name" htmlFor="city-name" skin="dark" required><Input id="city-name" skin="dark" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="State" htmlFor="city-state" skin="dark" required><Input id="city-state" skin="dark" value={editing.state} onChange={(e) => setEditing({ ...editing, state: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Region" value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} options={["North", "North · Delhi NCR", "West", "South", "East", "Central"].map((r) => ({ value: r, label: r }))} />
              <Select label="Coverage" value={editing.coverage} onChange={(e) => setEditing({ ...editing, coverage: e.target.value as AdminCity["coverage"] })} options={["live", "illustrative", "planned", "hidden"].map((r) => ({ value: r, label: r }))} />
            </div>
            {err && <p className="text-[12.5px] text-negative" role="alert">{err}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------ micromarkets */

export function MicromarketManagement() {
  const { micromarkets, cities, update } = useAdmin();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [editing, setEditing] = useState<AdminMicromarket | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const cityName = (id: string) => cities.find((c) => c.id === id)?.name ?? id;
  const rows = useMemo(
    () => micromarkets.filter((m) => (city === "all" || m.cityId === city) && (!q || `${m.name} ${m.aliases}`.toLowerCase().includes(q.toLowerCase()))),
    [micromarkets, q, city],
  );

  function save() {
    if (!editing) return;
    if (editing.name.trim().length < 2) return setErr("Name is required.");
    if (micromarkets.some((m) => m.id !== editing.id && m.cityId === editing.cityId && m.name.toLowerCase() === editing.name.trim().toLowerCase())) return setErr("This city already has a micromarket with that name.");
    update((s) => ({
      ...s,
      micromarkets: isNew ? [...s.micromarkets, { ...editing, name: editing.name.trim() }] : s.micromarkets.map((m) => (m.id === editing.id ? editing : m)),
      cities: isNew ? s.cities.map((c) => (c.id === editing.cityId ? { ...c, micromarkets: c.micromarkets + 1 } : c)) : s.cities,
    }));
    setEditing(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="Micromarket Management"
        description="Locality master data: names, city mapping, search aliases and active status. Uploads are validated against this master."
        actions={
          <Button size="sm" onClick={() => { setErr(null); setIsNew(true); setEditing({ id: newId("mm-"), name: "", cityId: city === "all" ? cities[0]?.id ?? "" : city, aliases: "", active: true }); }}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add micromarket
          </Button>
        }
      />
      <Panel
        title={`${rows.length} micromarkets`}
        actions={
          <div className="flex gap-2">
            <select aria-label="Filter by city" value={city} onChange={(e) => setCity(e.target.value)} className="h-8 rounded-sm bg-ink-850 px-2 text-[12.5px] text-white ring-1 ring-inset ring-ink-600">
              <option value="all">All cities</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <SearchBox value={q} onChange={setQ} placeholder="Search micromarkets" />
          </div>
        }
      >
        <div className="max-h-[620px] overflow-auto scrollbar-thin">
          <table className="w-full min-w-[720px]">
            <thead className="sticky top-0 bg-ink-800">
              <tr className="border-b border-ink-600/60">
                {["Micromarket", "City", "ID", "Aliases", "Active", ""].map((h) => <th key={h} className={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className={cn("border-b border-ink-700/60", !m.active && "opacity-50")}>
                  <td className={`${td} font-medium`}>{m.name}</td>
                  <td className={`${td} text-white/70`}>{cityName(m.cityId)}</td>
                  <td className={`${td} font-mono text-[12px] text-muted`}>{m.id}</td>
                  <td className={`${td} text-white/60`}>{m.aliases || "—"}</td>
                  <td className={td}>
                    <input type="checkbox" className="h-4 w-4 accent-signal-500" aria-label={`${m.name} active`} checked={m.active} onChange={(e) => update((s) => ({ ...s, micromarkets: s.micromarkets.map((x) => (x.id === m.id ? { ...x, active: e.target.checked } : x)) }))} />
                  </td>
                  <td className={`${td} text-right`}>
                    <button type="button" onClick={() => { setErr(null); setIsNew(false); setEditing(m); }} className="rounded-xs p-1.5 text-muted hover:bg-white/5 hover:text-white" aria-label={`Edit ${m.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Add micromarket" : `Edit ${editing?.name}`} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        {editing && (
          <div className="grid gap-4">
            <Field label="Micromarket name" htmlFor="mm-name" skin="dark" required><Input id="mm-name" skin="dark" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Select label="City" value={editing.cityId} disabled={!isNew} onChange={(e) => setEditing({ ...editing, cityId: e.target.value })} options={cities.map((c) => ({ value: c.id, label: c.name }))} />
            <Field label="Search aliases" htmlFor="mm-aliases" skin="dark" hint="Comma-separated alternative spellings used for matching uploads"><Input id="mm-aliases" skin="dark" value={editing.aliases} onChange={(e) => setEditing({ ...editing, aliases: e.target.value })} /></Field>
            {err && <p className="text-[12.5px] text-negative" role="alert">{err}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ----------------------------------------------------------------- clients */

const STATUS_TONE = { active: "good", trial: "info", suspended: "bad" } as const;

export function ClientManagement() {
  const { clients, plans, update } = useAdmin();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminClient | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const rows = useMemo(() => clients.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase())), [clients, q]);
  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? id;

  function save() {
    if (!editing) return;
    if (editing.name.trim().length < 2) return setErr("Organisation name is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editing.renewal)) return setErr("Renewal date is required.");
    if (editing.users < 0 || !Number.isInteger(editing.users)) return setErr("Users must be a whole number.");
    const seats = plans.find((p) => p.id === editing.plan)?.seats ?? Infinity;
    if (editing.users > seats) return setErr(`The ${planName(editing.plan)} plan allows up to ${seats} users.`);
    update((s) => ({ ...s, clients: isNew ? [...s.clients, { ...editing, name: editing.name.trim() }] : s.clients.map((c) => (c.id === editing.id ? editing : c)) }));
    setEditing(null);
  }

  return (
    <div>
      <AdminPageHeader
        title="Client Management"
        description="Organisations with platform access. All organisations listed are fictional demo entries."
        actions={
          <Button size="sm" onClick={() => { setErr(null); setIsNew(true); setEditing({ id: newId("c"), name: "", type: "Developer", users: 1, plan: plans[0]?.id ?? "", status: "trial", renewal: "2027-03-31" }); }}>
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add client
          </Button>
        }
      />
      <Panel title={`${rows.length} organisations`} actions={<SearchBox value={q} onChange={setQ} placeholder="Search organisations" />}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-ink-600/60">
                {["Organisation", "Type", "Plan", "Users", "Status", "Renewal", ""].map((h) => <th key={h} className={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-ink-700/60">
                  <td className={`${td} font-medium`}>{c.name}</td>
                  <td className={`${td} text-white/70`}>{c.type}</td>
                  <td className={td}>{planName(c.plan)}</td>
                  <td className={`${td} font-mono`}>{c.users}</td>
                  <td className={td}><StatusPill tone={STATUS_TONE[c.status]}>{c.status}</StatusPill></td>
                  <td className={`${td} text-white/70`}>{new Date(c.renewal).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                  <td className={`${td} text-right`}>
                    <button type="button" onClick={() => { setErr(null); setIsNew(false); setEditing(c); }} className="rounded-xs p-1.5 text-muted hover:bg-white/5 hover:text-white" aria-label={`Edit ${c.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Add client" : `Edit ${editing?.name}`} footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        {editing && (
          <div className="grid gap-4">
            <Field label="Organisation name" htmlFor="cl-name" skin="dark" required><Input id="cl-name" skin="dark" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as AdminClient["type"] })} options={["Developer", "Financial Institution", "Consultancy", "Institution"].map((v) => ({ value: v, label: v }))} />
              <Select label="Plan" value={editing.plan} onChange={(e) => setEditing({ ...editing, plan: e.target.value })} options={plans.map((p) => ({ value: p.id, label: `${p.name} (${p.seats} seats)` }))} />
              <Select label="Status" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as AdminClient["status"] })} options={["active", "trial", "suspended"].map((v) => ({ value: v, label: v }))} />
              <Field label="Users" htmlFor="cl-users" skin="dark"><Input id="cl-users" skin="dark" type="number" min={0} value={editing.users} onChange={(e) => setEditing({ ...editing, users: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Renewal date" htmlFor="cl-renewal" skin="dark"><Input id="cl-renewal" skin="dark" type="date" value={editing.renewal} onChange={(e) => setEditing({ ...editing, renewal: e.target.value })} /></Field>
            {err && <p className="text-[12.5px] text-negative" role="alert">{err}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
